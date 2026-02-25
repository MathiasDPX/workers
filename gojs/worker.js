export default {
    async fetch(request) {
        const url = new URL(request.url);

        // Get domain from Referer header
        let domain;
        const referer = request.headers.get("referer");

        if (url.searchParams.get('host')) {
            domain = url.searchParams.get('host')
        } else if (referer) {
            try {
                domain = new URL(referer).hostname;
            } catch {
                domain = url.hostname; // fallback if Referer is malformed
            }
        } else {
            domain = url.hostname; // fallback if no Referer
        }

        // Fetch original GoJS
        const response = await fetch("https://gojs.net/latest/release/go.js");
        if (!response.ok) {
            return new Response("Failed to fetch go.js", { status: 500 });
        }

        let content = await response.text();

        const originalEncrypted = rc4EncryptToHex("gojs.net");
        const replacementEncrypted = rc4EncryptToHex(domain);

        // Dont replace all occurences as `KF:"key"` was causing a mouse offset
        content = content.replace(`m!==n("${originalEncrypted}")`, `m!==n("${replacementEncrypted}")`);
        content = content.replace(`${originalEncrypted}"));this.bi`, `${replacementEncrypted}"));this.bi`);

        content = `// Go.JS for ${domain} (${replacementEncrypted})\n\n` + content;

        return new Response(content, {
            status: 200,
            headers: {
                "Content-Type": "application/javascript",
            },
        });
    },
};

function rc4EncryptToHex(plaintext) {
    const keyByte = 119;

    const S = new Array(256);
    for (let i = 0; i < 256; i++) {
        S[i] = i;
    }

    // KSA
    let j = 0;
    for (let i = 0; i < 256; i++) {
        j = (j + S[i] + keyByte) % 256;
        [S[i], S[j]] = [S[j], S[i]];
    }

    // PRGA
    let i = 0;
    j = 0;
    const output = [];

    for (let c = 0; c < plaintext.length; c++) {
        i = (i + 1) % 256;
        j = (j + S[i]) % 256;
        [S[i], S[j]] = [S[j], S[i]];

        const K = S[(S[i] + S[j]) % 256];
        output.push(plaintext.charCodeAt(c) ^ K);
    }

    return output.map(byte => byte.toString(16).padStart(2, "0")).join("");
}