export default {
    async fetch(request) {
        const { searchParams } = new URL(request.url)
        let version = searchParams.get('v') || "latest"

        // Fetch original GoJS
        const response = await fetch(`https://gojs.net/${version}/release/go.js`);
        if (!response.ok) {
            return new Response("Failed to fetch go.js", { status: 500 });
        }

        let content = await response.text();

        // Patch domain check
        content = content.replace(
            /[a-z]\[[a-zA-Z]{1,2}\("73a612b6fb191d"\)\]\([a-zA-Z]{1,2}\("7da71ca0ad381e90"\)\)/g,
            "1"
        );

        return new Response(content, {
            status: 200,
            headers: {
                "Content-Type": "application/javascript",
            },
        });
    },
};