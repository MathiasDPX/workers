export default {
    async fetch(request) {
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Max-Age": "86400",
        };
                          
        const providers = {
            "landerneau": "https://gbfs.partners.fifteen.eu/gbfs/2.2/landerneau/en",
            "brest": "https://gbfs.partners.fifteen.eu/gbfs/2.2/brest/en"
        }

        const url = new URL(request.url);
        const parts = url.pathname.split("/").filter(Boolean);

        const provider = parts[parts.length - 2];
        const endpoint = parts[parts.length - 1];

        if (!provider || !endpoint) {
            return new Response("Missing provider or endpoint", { status: 400 })
        }

        console.log(provider, endpoint)
        if (!(provider in providers)) {
            return new Response("Unknown provider", { status: 404 })
        }

        const gbfsUrl = `${providers[provider]}/${endpoint}`;
        console.log(gbfsUrl)
        const response = await fetch(gbfsUrl);
        if (!response.ok) {
            return new Response("Failed to fetch GBFS data", { status: 500 });
        }

        let content = await response.text();

        let rootUrl = new URL("..", request.url);
        rootUrl.pathname += provider
        content = content.replaceAll(providers[provider], rootUrl.href);

        return new Response(content, {
            status: 200,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
            },
        });
    },
};
