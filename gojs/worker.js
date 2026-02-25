export default {
    async fetch(request) {
        // Fetch original GoJS
        const response = await fetch("https://gojs.net/latest/release/go.js");
        if (!response.ok) {
            return new Response("Failed to fetch go.js", { status: 500 });
        }

        // Patch domain check
        let content = await response.text();
        content = content.replace(/const a=i\[n\("[0-9a-fA-F]+"\)\]\(n\("[0-9a-fA-F]+"\)\);/g, `const a=1;`);

        return new Response(content, {
            status: 200,
            headers: {
                "Content-Type": "application/javascript",
            },
        });
    },
};