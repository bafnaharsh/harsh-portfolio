// Serves the RFC 9727 API catalog with its registered media type.
//
// The catalog itself is a static file generated at build time
// (dist/.well-known/api-catalog.json). This function only exists to guarantee
// `Content-Type: application/linkset+json` on the extensionless well-known
// path regardless of how the CDN infers types for files without extensions.
import type { Config } from "@netlify/edge-functions";

export default async (request: Request) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } });
  }
  const url = new URL(request.url);
  const res = await fetch(new URL("/.well-known/api-catalog.json", url.origin));
  if (!res.ok) return new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });

  const body = request.method === "HEAD" ? null : await res.text();
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=3600",
      "x-content-type-options": "nosniff",
    },
  });
};

export const config: Config = {
  path: "/.well-known/api-catalog",
};
