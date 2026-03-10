function makeResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json"
        }
    });
}

export default {
    async fetch(request, env, ctx) {
        const API_KEY = env.LASTFM_API_KEY;
        const LASTFM_USERNAME = env.LASTFM_USERNAME;

        const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${API_KEY}&format=json&limit=1`);
        if (!res.ok) {
            return makeResponse({"error": true, "message": "failed to fetch last.fm data"}, 500);
        }

        const result = await res.json();
        const tracks = result['recenttracks']['track'];

        let response = makeResponse({"playing": false});
        tracks.forEach((track) => {
            if (track?.['@attr']?.['nowplaying'] !== "true") {
                return response
            }
            const data = {
                "playing": true,
                "artist": track?.['artist']?.['#text'],
                "name": track?.['name'],
                "album": track?.['album']?.['#text'],
                "url": track?.['url'],
                "images": track?.['image'].reduce((acc, img) => {
                    acc[img.size] = img["#text"];
                    return acc;
                }, {})
            };

            response = makeResponse(data);
        });

        return response;
    },
};
