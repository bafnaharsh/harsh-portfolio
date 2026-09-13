# Harsh Bafna — Portfolio

🔗 **Live site:** [bafnaaharsh.netlify.app](https://bafnaaharsh.netlify.app)

A React + Vite single-page portfolio that is readable by people and by AI agents from the same source of truth.

---

## 🛠️ Tech stack

| Layer        | Choice                                                                          |
| ------------ | ------------------------------------------------------------------------------- |
| Build tool   | [Vite 8](https://vite.dev/) + `@vitejs/plugin-react`                            |
| UI library   | [React 19](https://react.dev/)                                                  |
| Routing      | [react-router-dom 7](https://reactrouter.com/)                                  |
| Components   | [MUI](https://mui.com/) + [react-bootstrap](https://react-bootstrap.github.io/) |
| Agent view   | [react-markdown](https://github.com/remarkjs/react-markdown)                    |
| Animation    | [react-type-animation](https://www.npmjs.com/package/react-type-animation) + canvas 2D |
| Linting      | [ESLint 9](https://eslint.org/) flat config                                     |
| Verification | [Playwright](https://playwright.dev/) — local checks only                       |
| Hosting      | [Netlify](https://www.netlify.com/) — static `dist/` + two Deno Edge Functions  |

## ✨ Features

- **Hero** — an interactive ASCII portrait on a `<canvas>`: glyph particles fly into place and repel from the pointer, under a typed greeting.
- **Sections** — About, Experience, Projects, Certifications, Education, Photography and Credits, every one of them rendered from the same data file.
- **Experience** — MUI tabs per company (vertical on desktop, scrollable on phones) with a **View internship certificate** button that opens the PDF in a modal.
- **Projects** — a carousel showing 1 / 2 / 3 cards by viewport width, driven by arrows, dots, ← → keys and pointer swipe.
- **Certifications** — pills that open a PDF modal with a copy-to-clipboard shareable link, plus standalone `/certificate/<slug>` routes (and `/cert/<slug>` aliases).
- **Photography** — a strip on the home page and a full `/photography` gallery, both feeding a lightbox with ← → navigation and Escape-to-close.
- **Resume** — a `/resume` route with the PDF inline, and a hero button that opens the same PDF in a modal.
- **Game mode** — a desktop-only mini game: toggle **GAME MODE** under the navbar, move with ←/→ or A/D, jump with Space, collect the 5 brain cells.
- **Human / Agent pill** — switches the page to `?view=agent`, the same portfolio data rendered as a markdown document with a *Copy raw Markdown* button.
- **Real 404 and per-route metadata** — unknown paths return HTTP 404 from `public/404.html`, and title, canonical, OG/Twitter tags and JSON-LD update on every route change.
- **Hover previews** — small "what does this do" cards on the navbar and hero links, with thumbnails from `public/previews/`.
- **Accessible and light** — focus-visible rings, `aria-label`s and Escape-to-close on both overlays, `prefers-reduced-motion` honoured, WebP images with fixed dimensions, lazy routes and vendor chunks.

## 🧭 Single source of truth

**`src/data/portfolio.js`** holds every fact the site states — `profile`, `about`, `links`, `experience`, `projects`, `skills`, `education`, `certifications`, `photography`, `credits`, `meta` — plus `SITE_URL`, `getCertificateBySlug()` and `routes()`. It is pure data, so plain Node can import it at build time. Everything else derives from it: the React components, the Agent view via `src/lib/markdown.js`, the head metadata via `src/lib/seo.js` (injected at build time by the `portfolio-head` Vite plugin, updated per route by `src/hooks/useRouteMeta.js`), and every file `scripts/generate-agent-assets.mjs` writes.

## 🤖 Agent-readable endpoints

`npm run build` writes these into `dist/` from the same data:

| Path                                   | Type                       | What it is                                                        |
| -------------------------------------- | -------------------------- | ----------------------------------------------------------------- |
| `/llms.txt`                            | `text/plain`               | Plain-text summary of the whole profile                           |
| `/api/profile.json`                    | `application/json`         | Role, links, skills, experience, education, certifications        |
| `/api/projects.json`                   | `application/json`         | All projects, plus one `/api/projects/<slug>.json` each           |
| `/_md/*.md`                            | `text/markdown`            | `index`, `resume`, `photography` and one per certificate          |
| `/.well-known/api-catalog`             | `application/linkset+json` | RFC 9727 linkset, served by the `api-catalog` edge function       |
| `/.well-known/ard.json`                | `application/json`         | Agentic Resource Discovery catalog (legacy mirror: `ai-catalog.json`) |
| `/.well-known/agent-skills/index.json` | `application/json`         | Agent Skills Discovery index, alongside its `SKILL.md`            |
| `/sitemap.xml`                         | `application/xml`          | Every route from `routes()`                                       |

`netlify/edge-functions/markdown-negotiation.ts` returns the matching markdown document when a request asks for it; in a browser, append **`?view=agent`** to any route for the same document rendered on the page.

```sh
curl -H "Accept: text/markdown" https://bafnaaharsh.netlify.app/
```

`public/robots.txt` carries `Content-Signal:`, per-bot `Allow:`, `Sitemap:` and `Agentmap:` lines, and `public/_headers` advertises the same documents through `Link:` headers (`rel="alternate"`, `rel="api-catalog"`, `rel="ard"`, `rel="ai-catalog"`) on every response.

## ☁️ Netlify

- **`netlify.toml`** — `npm run build`, publish `dist/`, Node 22. Netlify builds straight from the repo; no environment variables or secrets are used.
- **`_redirects`** (generated) — one `200` rewrite per real route, then `/* /404.html 404` so unknown paths are a genuine 404 rather than a soft SPA one.
- **`public/_headers`** — `nosniff` and `Referrer-Policy` everywhere, the `Link:` alternates, content types + CORS + `max-age=3600` for the agent endpoints, and immutable caching for the content-hashed `/assets/*.js` and `*.css` only — images keep their filenames, so they stay revalidatable.
- **Edge functions** — `markdown-negotiation.ts` (Accept negotiation) and `api-catalog.ts` (guarantees `application/linkset+json` on the extensionless well-known path).
- `npm run dev` and `vite preview` serve the app only — only **`netlify serve`** runs the redirects, headers and edge functions locally.

## 🚀 Getting started

```sh
npm install
npm run dev        # Vite dev server on http://localhost:5173
```

```sh
npm install -g netlify-cli
netlify serve      # builds, then serves the full stack at http://localhost:8888
```

## 📦 Scripts

| Command                              | What it does                                                               |
| ------------------------------------ | --------------------------------------------------------------------------- |
| `npm run dev`                        | Vite dev server                                                             |
| `npm run build`                      | `vite build`, then `node scripts/generate-agent-assets.mjs`                  |
| `npm run preview`                    | `vite preview` over the built `dist/`                                       |
| `npm run lint`                       | `eslint .`                                                                  |
| `npm run verify`                     | Playwright route + game-mode regression check — needs the site **already running** (`scripts/verify.mjs [baseUrl]`, default `http://localhost:8888`) |
| `node scripts/optimize-images.mjs`   | Re-encode images to WebP (`--dry-run` reports only, `--dims <file…>` prints pixel sizes) |
| `node scripts/generate-previews.mjs` | Regenerate the hover-preview thumbnails in `public/previews/` (`--headed` to watch) |

## ✏️ Editing content

Change **`src/data/portfolio.js`** — the UI, the Agent view, `llms.txt`, the JSON API, the discovery documents, the sitemap, `_redirects` and the head metadata all follow on the next build.

- **Add a project** — append to `projects` with a unique `slug`, then map that slug to an icon in `PROJECT_ICONS` in `src/components/Projects.jsx`.
- **Add a certificate** — drop the PDF in `public/certs/`, append to `certifications` with `slug`, `name`, `issuer` and `file`, then map the slug to an icon in `ICONS` in `src/data/certificates.js`.
- **Add a photo** — put the image in `public/assets/photography/`, run `node scripts/optimize-images.mjs`, then add `src`, `title`, `width` and `height` to `photography.photos`.
- **Résumé** — the PDF is `public/HarshBafna.pdf`, referenced once as `links.resume`.

## 📄 License

All rights reserved © Harsh Bafna.
