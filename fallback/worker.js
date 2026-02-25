import html from "./index.html"

export default {
    fetch() {
        return new Response(html, {
            headers: { "content-type": "text/html;charset=UTF-8" },
        })
    },
}