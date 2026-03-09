export default {
    async fetch(request) {
        const url = new URL(request.url);
        const proxiedUrl = url.searchParams.get("url");

        if (!proxiedUrl) {
            return new Response("No URL", { status: 400 });
        }

        const response = await fetch(proxiedUrl);

        const newHeaders = new Headers(response.headers);
        newHeaders.set("Access-Control-Allow-Origin", "*");
        newHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        newHeaders.set("Access-Control-Allow-Headers", "*");

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    }
};