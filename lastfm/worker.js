export default {
    async fetch(request, env, ctx) {
        const API_KEY = env.API_KEY;
        const LASTFM_USERNAME = env.LASTFM_USERNAME;

        const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${API_KEY}&format=json&limit=1`);
        if (!res.ok) {
            return new Response("Failed to fetch last.fm api", { status: 500 });
        }

        const result = await res.json();
        const tracks = result['recenttracks']['track'];

        let response = new Response(JSON.stringify({"playing": false}), { status: 200 });
        tracks.forEach((track) => {
            if (track?.['@attr']?.['nowplaying'] !== "true") {
                return response
            }
            const data = {
                "artist": track?.['artist']?.['#text'],
                "name": track?.['name'],
                "album": track?.['album']?.['#text'],
                "url": track?.['url'],
                "images": track?.['image'].reduce((acc, img) => {
                    acc[img.size] = img["#text"];
                    return acc;
                }, {})
            };

            response = new Response(JSON.stringify(data), {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        });

        return response;
    },
};
