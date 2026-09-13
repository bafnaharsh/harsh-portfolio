# Harsh Bafna — Portfolio

🔗 **Live site:** [bafnaaharsh.netlify.app](https://bafnaaharsh.netlify.app)

A React + Vite single-page portfolio that is readable by people and by AI agents from the same source of truth.

---

## 🛠️ Tech stack

| Layer        | Choice                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------- |
| Build tool   | [Vite 8](https://vite.dev/) (Rolldown bundler) + `@vitejs/plugin-react`                                              |
| UI library   | [React 19](https://react.dev/) (`StrictMode`, `lazy` + `Suspense`)                                                    |
| Routing      | [react-router-dom 7](https://reactrouter.com/) (`BrowserRouter`)                                                      |
| Components   | [MUI](https://mui.com/) (icons, Tabs, `useMediaQuery`) + [react-bootstrap](https://react-bootstrap.github.io/) (navbar) |
| Agent view   | [react-markdown](https://github.com/remarkjs/react-markdown)                                                          |
| Animation    | [react-type-animation](https://www.npmjs.com/package/react-type-animation), canvas 2D, CSS transitions, `IntersectionObserver` |
| Linting      | [ESLint 9](https://eslint.org/) flat config (`js.recommended`, React Hooks, React Refresh)                             |
| Verification | [Playwright](https://playwright.dev/) — local scripts only, no test runner in CI                                       |
| Hosting      | [Netlify](https://www.netlify.com/) — static `dist/` + two Deno Edge Functions                                         |

## ✨ Features

- **Hero** — an interactive ASCII portrait on a `<canvas>`: a few thousand glyph particles fly in to their target positions and repel from the pointer (or touch), with a typed `hi, harsh here.` greeting.
- **About** — paragraphs and a tech-stack list, both rendered from data segments so the same text can also be serialised to markdown.
- **Experience** — MUI `Tabs` (vertical on desktop, scrollable horizontal below the `md` breakpoint) with a highlighted selected company and a **View internship certificate** button that opens the JP Morgan PDF in a modal.
- **Projects** — a carousel showing 1 / 2 / 3 cards by viewport width, driven by arrows, dots, ← → keys when focused, and pointer swipe (45px threshold); index wraps at both ends.
- **Certifications** — pills that open a PDF modal with a copy-to-clipboard **shareable link**, plus standalone routes `/certificate/<slug>` (and the `/cert/<slug>` alias) that render the PDF inline and cross-link the other certificates.
- **Education** and **Credits** — plain data-driven sections.
- **Photography** — a strip on the home page and a full `/photography` gallery (reverse order), both feeding a lightbox with ← → navigation, Escape-to-close and body-scroll lock. Photos that fail to load are dropped silently.
- **Resume** — a `/resume` route with the PDF inline, and a hero button that opens the same PDF in a modal.
- **Back to top** — a floating button that appears past 60% of a viewport of scroll and eases home with a distance-scaled `easeInOutCubic` (350–900ms), cancelled the instant you scroll yourself; it jumps instantly under `prefers-reduced-motion`.
- **Hover previews** — small "what does this do" cards portalled to `<body>` from the navbar email/GitHub/LinkedIn icons and the hero Email/Resume buttons, with thumbnails from `public/previews/` for GitHub, LinkedIn and the résumé. Pointer-hover devices only, keyboard focus-visible also opens them, Escape closes.
- **Game mode** — the **GAME MODE** toggle under the navbar at top-left (desktop only; hidden ≤800px and in Agent view) that overlays a full-viewport, `pointer-events: none` canvas on the real page. A pixel blob spawns onto ledges, then you play: **←/→ or A/D** to move, **Space / ↑ / W** to jump, scrolling still works and the camera follows the blob. Headings, paragraphs and list items on the page act as platforms. Goal: collect **5 scattered brain cells** (`0 / 5` counter). Falling off the bottom shows *you fell* — Space or the button restarts. Collecting all five shows *neurons restored*. The game survives client-side navigation; reload or toggling off ends it.
- **Human / Agent pill** — a bottom-centre radiogroup. **Agent** switches the page to `?view=agent`, which renders the same portfolio data as a markdown document (via `react-markdown`) with a `text/markdown` label and a *Copy raw Markdown* button. The mode lives in the URL, so it is linkable, refreshable and Back-button correct.
- **Real 404** — unknown paths return HTTP 404 from `public/404.html`; inside the SPA the catch-all route renders a themed not-found page.
- **Per-route metadata** — title, description, canonical, OG/Twitter tags, `robots`, and the `ProfilePage` JSON-LD are updated on every route change.

## 📁 Project structure

```
├── index.html                    <!--%PORTFOLIO_HEAD%--> placeholder for the generated <head>
├── vite.config.js                react plugin + portfolioHead plugin + manual vendor chunks
├── eslint.config.js              ESLint 9 flat config (ignores dist/, .tmp-dist-*, .netlify)
├── netlify.toml                  build command, publish dir, NODE_VERSION
├── netlify/edge-functions/
│   ├── markdown-negotiation.ts   Accept: text/markdown → /_md/**.md
│   └── api-catalog.ts            /.well-known/api-catalog as application/linkset+json
├── public/                       copied verbatim into dist/
│   ├── _headers                  security, content types, CORS, caching, Link: rel=alternate
│   ├── robots.txt                Content-Signal, per-bot Allow, Sitemap, Agentmap
│   ├── 404.html                  the real 404 body Netlify serves
│   ├── HarshBafna.pdf            résumé
│   ├── certs/*.pdf               certificate PDFs
│   ├── assets/                   about-harsh.webp + photography/*.webp
│   ├── previews/                 hover-preview thumbnails (generated, committed)
│   ├── profile.webp              source image for the ASCII portrait
│   ├── og-image.png, favicon.ico, logo192.png, logo512.png, manifest.json
├── scripts/
│   ├── generate-agent-assets.mjs post-build: every machine-readable artefact
│   ├── generate-previews.mjs     hover-preview thumbnails → public/previews/
│   ├── pack-ascii-data.mjs       re-packs src/assets/asciiData.js
│   ├── optimize-images.mjs       WebP re-encode via headless Chromium
│   └── verify.mjs                Playwright route + game-mode regression check
└── src/
    ├── main.jsx                  React root, BrowserRouter, bootstrap CSS
    ├── App.jsx                   routes, lazy pages, game toggle, view-mode pill
    ├── assets/asciiData.js       pre-computed ASCII particle data (lazy chunk)
    ├── data/
    │   ├── portfolio.js          THE single source of truth
    │   ├── certificates.js       portfolio.certifications + an icon per slug
    │   └── photos.js             re-export of portfolio.photography
    ├── lib/
    │   ├── markdown.js           portfolio → markdown documents + llms.txt
    │   └── seo.js                routeMeta, Person/ProfilePage JSON-LD, staticHeadHtml
    ├── hooks/
    │   ├── useRouteMeta.js       per-route <head> updates
    │   └── useViewMode.js        ?view=agent state
    ├── components/               24 components (see Features above)
    └── styles/                   one CSS file per component + Global.css
```

## 🧭 Single source of truth

**`src/data/portfolio.js`** holds every fact the site states — `profile`, `about`, `links`, `experience`, `projects`, `skills`, `education`, `certifications`, `photography`, `credits`, `meta` — plus `SITE_URL`, `getCertificateBySlug()` and `routes()`. It is pure data (no React, no icons) so plain Node can import it at build time.

Everything else derives from it:

| Consumer                            | How                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------- |
| React UI                            | components import `portfolio` directly                                           |
| Agent view (`?view=agent`)          | `src/lib/markdown.js` → `renderRouteMarkdown()` rendered by react-markdown       |
| Static `<head>`                     | `src/lib/seo.js` → `staticHeadHtml()`, injected by the `portfolioHead` Vite plugin |
| Per-route `<head>`                  | `src/hooks/useRouteMeta.js` → `routeMeta()` / `profilePageJsonLd()`               |
| `_md/`, `llms.txt`, `/api/*`, `.well-known/*`, `_redirects`, `sitemap.xml` | `scripts/generate-agent-assets.mjs` |

## 🤖 Agent-readable endpoints

`npm run build` writes **25 files** into `dist/` from the same data:

| Path                                                    | Content type                | What it is                                        |
| ------------------------------------------------------- | --------------------------- | ------------------------------------------------- |
| `/llms.txt`                                             | `text/plain`                | Plain-text summary of the whole profile           |
| `/api/profile.json`                                     | `application/json`          | Role, summary, links, skills, experience, education, certifications |
| `/api/projects.json`                                    | `application/json`          | `{ owner, count, projects[] }`                    |
| `/api/projects/<slug>.json`                             | `application/json`          | One project each (5 files)                        |
| `/_md/index.md`                                         | `text/markdown`             | Full profile as markdown                          |
| `/_md/resume.md`, `/_md/photography.md`                 | `text/markdown`             | Route-specific documents                          |
| `/_md/certificate/<slug>.md`                            | `text/markdown`             | One per certificate (6 files)                     |
| `/.well-known/api-catalog`                              | `application/linkset+json`  | RFC 9727 linkset (served by the `api-catalog` edge function; a `.json` twin is the file it reads) |
| `/.well-known/ard.json`                                 | `application/json`          | Agentic Resource Discovery catalog, specVersion 0.91 |
| `/.well-known/ai-catalog.json`                          | `application/json`          | Legacy mirror of `ard.json`                       |
| `/.well-known/agent-skills/index.json`                  | `application/json`          | Agent Skills Discovery 0.2.0, with a sha256 digest |
| `/.well-known/agent-skills/harsh-bafna-profile/SKILL.md`| `text/markdown`             | The skill itself                                  |
| `/sitemap.xml`                                          | `application/xml`           | Every route from `routes()`                       |
| `/_redirects`                                           | —                           | Explicit SPA routes + the catch-all 404           |

### `Accept: text/markdown` negotiation

`netlify/edge-functions/markdown-negotiation.ts` runs on `/*` (static assets, `/api/*`, `/_md/*`, `/.well-known/*` and file extensions are excluded). It parses the `Accept` header with `q` values and returns markdown **only** when `text/markdown` (or `text/x-markdown`) is present with `q > 0` and is not ranked below `text/html` — so a browser's `text/html,…,*/*;q=0.8` never triggers it. A match maps the route to its `/_md/**.md` document and responds `200` with `Content-Type: text/markdown; charset=utf-8`, `Vary: Accept` and a `Link: …; rel="canonical"`. Anything else falls through to the normal HTML path.

```sh
curl -H "Accept: text/markdown" https://bafnaaharsh.netlify.app/
curl -H "Accept: text/markdown" https://bafnaaharsh.netlify.app/certificate/google-ml-engineer
```

In a browser, append **`?view=agent`** to any route for the same document rendered on the page.

Discovery is also advertised statically: `public/robots.txt` carries `Content-Signal: ai-train=no, search=yes, ai-input=yes`, per-bot `Allow:` rules, `Sitemap:` and `Agentmap: …/.well-known/ard.json`; `public/_headers` sends `Link:` headers on every response for `</_md/index.md>; rel="alternate"`, `</llms.txt>; rel="alternate"`, `</.well-known/api-catalog>; rel="api-catalog"`, `</.well-known/ard.json>; rel="ard"` and `</.well-known/ai-catalog.json>; rel="ai-catalog"`.

## ☁️ Netlify configuration

- **`netlify.toml`** — `command = "npm run build"`, `publish = "dist"`, `NODE_VERSION = "22"`.
- **`public/_headers`** — `X-Content-Type-Options: nosniff` and `Referrer-Policy` everywhere, the `Link:` alternates above, correct content types + `Access-Control-Allow-Origin: *` + `max-age=3600` for `/_md/*`, `/llms.txt`, `/api/*` and `/.well-known/*`, and `max-age=31536000, immutable` for hashed `/assets/*`.
- **`_redirects`** (generated) — one `200` rewrite to `/index.html` per real route (from the same `routes()` list as the sitemap, plus the `/cert/<slug>` aliases), then `/* /404.html 404` so unknown paths are a genuine 404 rather than a soft SPA one.
- **Edge functions** (`netlify/edge-functions/`) — `markdown-negotiation.ts` (Accept negotiation) and `api-catalog.ts` (guarantees `application/linkset+json` on the extensionless well-known path).

`npm run dev` and `vite preview` serve the app only — **no redirects, headers or edge functions**. Use `netlify serve` to exercise the whole stack locally.

## 🚀 Getting started

```sh
npm install
npm run dev        # Vite dev server on http://localhost:5173 (host: true)
```

```sh
npm install -g netlify-cli
netlify serve      # builds, then serves the full stack at http://localhost:8888
```

## 📦 Scripts

| Command                              | What it does                                                                  |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| `npm run dev`                        | Vite dev server                                                               |
| `npm run build`                      | `vite build` then `node scripts/generate-agent-assets.mjs`                     |
| `npm run preview`                    | `vite preview` over the built `dist/`                                          |
| `npm run lint`                       | `eslint .`                                                                    |
| `npm run verify`                     | Playwright regression check (see below)                                       |
| `node scripts/optimize-images.mjs`   | Re-encode images to WebP with headless Chromium                               |

**`npm run verify`** (`scripts/verify.mjs [baseUrl]`, default `http://localhost:8888`) needs the site **already running** — start `netlify serve` first. It hard-loads all 12 routes at desktop (1280×800) and phone (390×844) widths, asserting HTTP 200, expected content, no horizontal scroll and no console errors; checks three unknown paths return a real 404; then walks the game-mode checklist: toggle on/off, full-viewport canvas with `pointer-events: none`, `0 / 5` counter, the hover info panel, Space not scrolling the page, survival across client-side navigation and Back, clean teardown with no leftover inline body style, counter reset on re-entry, game off after reload, the pill hiding while the game is active, and the toggle being hidden at phone width. It prints one PASS/FAIL line per step and exits non-zero on any failure.

**`node scripts/optimize-images.mjs`** decodes each source through a `data:` URL in headless Chromium, downscales by step-wise halving and re-encodes as WebP. Photography is capped at 1600px on the longest side at quality 0.82; `public/assets/about-harsh.webp` is written at 600×600 at quality 0.85. Originals are never deleted.

```sh
node scripts/optimize-images.mjs                 # optimise in place
node scripts/optimize-images.mjs --dry-run       # report only
node scripts/optimize-images.mjs --dims <file…>  # print real pixel dimensions
```

Two more helpers regenerate committed artefacts and are never run by the site itself:

- **`node scripts/generate-previews.mjs`** regenerates the hover-preview thumbnails in `public/previews/` (`github.webp`, `linkedin.webp`, `resume.webp`) with Playwright, then commits them. Pass target names to do only some, or `--headed` to watch. GitHub is a real screenshot; LinkedIn falls back to a card built solely from `portfolio.js` facts when it serves an auth wall; the résumé page 1 is rendered through pdf.js.
- **`node scripts/pack-ascii-data.mjs`** re-packs `src/assets/asciiData.js` from the portrait image data.

Quick manual checks against a running server:

```sh
curl -H "Accept: text/markdown" http://localhost:8888/          # markdown for agents
curl -sI http://localhost:8888/this-does-not-exist              # real 404
curl -s http://localhost:8888/.well-known/api-catalog           # RFC 9727 linkset
```

## ✏️ Editing content

Change **`src/data/portfolio.js`** only. The React UI, the agent view, `llms.txt`, the JSON API, the discovery documents, the sitemap, `_redirects` and the head metadata all follow on the next build.

- **Add a project** — append to `projects` with a unique `slug`; map that slug to an MUI icon in `PROJECT_ICONS` in `src/components/Projects.jsx` (it falls back to a storage icon). A `/api/projects/<slug>.json` file appears automatically.
- **Add a certificate** — drop the PDF in `public/certs/`, append to `certifications` with `slug`, `name`, `issuer` and `file`; map the slug to an icon in `ICONS` in `src/data/certificates.js`. The `/certificate/<slug>` route, its `/cert/<slug>` alias, its markdown document, its sitemap entry and its redirect line are all derived.
- **Add a photo** — put the image in `public/assets/photography/`, run `node scripts/optimize-images.mjs`, then add an entry with `src`, `title`, `width` and `height` to `photography.photos`.
- **Metadata** — `meta.title`/`description`/`ogDescription`/`twitterDescription`/`keywords` feed both the build-time `<head>` and the runtime per-route tags. The Open Graph image is the static `public/og-image.png` (1200×630) and is not generated.
- **Résumé** — the PDF is `public/HarshBafna.pdf`, referenced once as `links.resume`.

## ♿ Accessibility & performance

- Semantic headings (one `<h1>` per route), `aria-label`s on every icon-only control, `role="dialog" aria-modal="true"` on the PDF and photo overlays, and a `radiogroup` with arrow-key support for the Human/Agent pill.
- Visible `:focus-visible` rings across the interactive components; tap targets extended to the 44px minimum (back-to-top, carousel dots, gallery back button, agent-view bar, game toggle).
- Both overlays move focus to the close button on open and restore it to the trigger on close, lock body scroll, and close on Escape.
- `prefers-reduced-motion: reduce` is honoured in `App.css`, `BackToTop` (instant jump instead of the eased scroll), `Experience.css`, `HoverPreview.css`, `ScrollProgress.css` and `ViewModeToggle.css`.
- Images are WebP with explicit `width`/`height` (no layout shift), `loading="lazy"` and `decoding="async"`.
- `react`, `@mui`/`@emotion` and `react-bootstrap` are split into long-cached vendor chunks; `PhotographyGallery`, `CertificateViewer`, `ResumeViewer`, `NotFound` and `AgentView` are lazy routes, and the ~290KB ASCII particle data is its own lazily-imported chunk.
- The ASCII render loop parks itself once every particle has settled and the pointer is away, and stops entirely when the hero scrolls out of view or the tab is hidden — it restarts on pointer, visibility or intersection. Scroll handlers are passive and coalesced into one `requestAnimationFrame` update.

## 🚢 Deployment

Netlify builds straight from the repository: `npm run build`, publish `dist/`, Node **22** pinned in `netlify.toml`. Edge functions deploy from `netlify/edge-functions/`. Every branch and pull request gets its own deploy preview. **No environment variables or secrets are used** — the build reads nothing but the repository.

## 📄 License

All rights reserved © Harsh Bafna.
