import html from "./index.html";

export default {
    async fetch(request) {
        const { searchParams } = new URL(request.url);
        const family = searchParams.get('family') || "solid";
        const version = searchParams.get('version') || "v7.3.0";
        const icon = searchParams.get('icon');

        if (icon == null) {
            return new Response(html, {
                headers: { "content-type": "text/html;charset=UTF-8" },
            })
        }

        const response = await fetch(`https://site-assets.fontawesome.com/releases/${version}/svgs-full/${family}/${icon}.svg`, {
            headers: {
                Origin: "https://fontawesome.com",
                Referer: "https://fontawesome.com"
            }
        });

        return new Response(await response.text(), {
            status: response.status,
            headers: {
                "Content-Type": "image/svg+xml",
            },
        });
    },
};