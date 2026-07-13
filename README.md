# Mathias's Workers

Collection of [Cloudflare Workers](https://workers.cloudflare.com/) for multiple uses

## GoJS

Serves [go.js](https://gojs.net/latest/) while dynamically replacing `gojs.net` domain references to match the requesting origin.

## Fallback

Serves a static HTML page for all failing URL

## cors-proxy

CORS Proxy for all kinds of url

## FontAwesome

Serves [Font Awesome](https://fontawesome.com/) icons through their CDN `site-assets.fontawesome.com` by faking the `Origin` and `Referer`