// HTTP content negotiation for agents.
//
// A request whose `Accept` header ranks `text/markdown` at least as high as
// `text/html` receives the pre-rendered markdown document for that route
// (written to dist/_md/ by scripts/generate-agent-assets.mjs) with
// `Content-Type: text/markdown; charset=utf-8` and `Vary: Accept`.
// Everything else falls through untouched to the normal HTML/SPA path.
import type { Config, Context } from "@netlify/edge-functions";

type Entry = { type: string; q: number };

function parseAccept(accept: string): Entry[] {
  return accept.split(",").map((part) => {
    const [type, ...params] = part.trim().split(";");
    const qParam = params.map((p) => p.trim()).find((p) => p.toLowerCase().startsWith("q="));
    const q = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
    return { type: type.trim().toLowerCase(), q: Number.isFinite(q) ? q : 0 };
  });
}

// True only when the client explicitly asks for markdown and does not rank
// HTML above it. Browsers send text/html first with */*;q=0.8, so a plain
// wildcard never triggers markdown.
export function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  const entries = parseAccept(accept);
  const md = entries.find((e) => e.type === "text/markdown" || e.type === "text/x-markdown");
  if (!md || md.q <= 0) return false;
  const html = entries.find((e) => e.type === "text/html" || e.type === "application/xhtml+xml");
  return !html || md.q >= html.q;
}

// Route → markdown document path. Returns null for routes with no document.
export function markdownPathFor(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return "/_md/index.md";
  if (path === "/photography" || path === "/resume") return `/_md${path}.md`;
  const cert = path.match(/^\/(?:certificate|cert)\/([A-Za-z0-9-]+)$/);
  if (cert) return `/_md/certificate/${cert[1]}.md`;
  return null;
}

export default async (request: Request, _context: Context) => {
  if (request.method !== "GET" && request.method !== "HEAD") return;
  if (!prefersMarkdown(request.headers.get("accept"))) return; // bypass → normal HTML

  const url = new URL(request.url);
  const mdPath = markdownPathFor(url.pathname);
  if (!mdPath) return; // unknown route → let the 404 rule handle it

  const res = await fetch(new URL(mdPath, url.origin), { headers: { accept: "text/markdown" } });
  if (!res.ok) return; // no document generated → HTML path

  const body = request.method === "HEAD" ? null : await res.text();
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      vary: "Accept",
      "cache-control": "public, max-age=3600",
      "x-content-type-options": "nosniff",
      link: `<${url.origin}${url.pathname}>; rel="canonical"`,
    },
  });
};

export const config: Config = {
  path: "/*",
  excludedPath: [
    "/assets/*",
    "/_md/*",
    "/api/*",
    "/.well-known/*",
    "/certs/*",
    "/.netlify/*",
    "/*.js",
    "/*.css",
    "/*.json",
    "/*.txt",
    "/*.xml",
    "/*.md",
    "/*.png",
    "/*.jpg",
    "/*.jpeg",
    "/*.svg",
    "/*.webp",
    "/*.ico",
    "/*.woff",
    "/*.woff2",
    "/*.pdf",
    "/*.html",
  ],
};
