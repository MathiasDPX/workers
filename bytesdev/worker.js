const BASE = "https://bytes.dev";

function parseDate(dateStr) {
    const [m, d, y] = dateStr.split("/").map(Number);
    return new Date(y, m - 1, d);
}

function toRFC822(date) {
    return date.toUTCString();
}

function escapeXml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function extractPostContent(html) {
    let post = html.match(/<div[^>]*class="post[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<!--\$!-->/);
    if (!post) {
        post = html.match(/<div[^>]*class="post[^"]*"[^>]*>([\s\S]*?)<\/div><\/div><footer/);
    }
    if (!post) return null;

    let content = post[1];

    content = content.replace(/<style[\s\S]*?<\/style>/gi, "");

    content = content.replace(/<\/?html[^>]*>/gi, "");
    content = content.replace(/<\/?head[^>]*>/gi, "");
    content = content.replace(/<\/?body[^>]*>/gi, "");
    content = content.replace(/<link[^>]*>/gi, "");
    content = content.replace(/<meta[^>]*>/gi, "");

    content = content.trim();
    return content;
}

function extractArticles(html) {
    const articles = [];

    const featuredRe = /<a[^>]*href="\/archives\/(\d+)"[^>]*>\s*<div[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[\s\S]*?<span[^>]*>(\d{1,2}\/\d{1,2}\/\d{4})<\/span>[\s\S]*?<p[^>]*>([^<]*)<\/p>/;
    const featured = html.match(featuredRe);
    if (featured) {
        articles.push({
            number: parseInt(featured[1]),
            image: featured[2],
            title: featured[3],
            date: featured[4],
            cta: featured[5].trim(),
        });
    }

    const archiveRe = /<li>\s*<a[^>]*href="\/archives\/(\d+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[\s\S]*?<span[^>]*>(\d{1,2}\/\d{1,2}\/\d{4})<\/span>/g;
    let match;
    while ((match = archiveRe.exec(html)) !== null) {
        articles.push({
            number: parseInt(match[1]),
            image: match[2],
            title: match[3],
            date: match[4],
            cta: "Read Issue →",
        });
    }

    articles.sort((a, b) => b.number - a.number);
    return articles.slice(0, 10);
}

async function fetchArticleContent(article) {
    const url = `${BASE}/archives/${article.number}`;
    try {
        const res = await fetch(url, {
            headers: { "User-Agent": "BytesDevRSSBot/1.0" },
        });
        if (!res.ok) return "";
        const html = await res.text();
        return extractPostContent(html) || "";
    } catch (e) {
        return "";
    }
}

async function buildRss(articles) {
    const now = new Date().toUTCString();
    const withContent = await Promise.all(
        articles.map(async (a) => ({ ...a, content: await fetchArticleContent(a) }))
    );

    const items = withContent
        .map((a) => {
            const url = `${BASE}/archives/${a.number}`;
            const pubDate = toRFC822(parseDate(a.date));
            const imageUrl = a.image.startsWith("http")
                ? a.image
                : `${BASE}${a.image}`;
            const description = a.content
                ? a.content
                : `<img src="${imageUrl}" alt="${escapeXml(a.title)}" />`;
            return `    <item>
      <title>${escapeXml(`Issue ${a.number}: ${a.title}`)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
    </item>`;
        })
        .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Bytes</title>
    <link>${BASE}/archives</link>
    <description>The most entertaining JavaScript newsletter on the planet</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${BASE}/archives" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

export default {
    async fetch(request) {
        const res = await fetch(`${BASE}/archives`, {
            headers: { "User-Agent": "BytesDevRSSBot/1.0" },
        });
        if (!res.ok) {
            return new Response("Failed to fetch archives", { status: 502 });
        }
        const html = await res.text();
        const articles = extractArticles(html);
        if (articles.length === 0) {
            return new Response("No articles found", { status: 500 });
        }
        const rss = await buildRss(articles);
        return new Response(rss, {
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Content-Disposition": "inline; filename=feed.xml",
                "Cache-Control": "public, max-age=3600",
            },
        });
    },
};