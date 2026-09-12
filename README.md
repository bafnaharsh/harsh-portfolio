# Harsh Bafna — Portfolio

🔗 **Live site:** [bafnaaharsh.netlify.app](https://bafnaaharsh.netlify.app)

A React + Vite single-page portfolio that is readable by people and by AI agents from the same source of truth.

---

## 🛠️ Tech stack

| Layer       | Choice                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------- |
| Build tool  | [Vite](https://vitejs.dev/)                                                                                   |
| UI library  | [React 19](https://react.dev/)                                                                                |
| Routing     | [react-router-dom](https://reactrouter.com/)                                                                  |
| Components  | [MUI](https://mui.com/) (icons, Tabs) + [react-bootstrap](https://react-bootstrap.github.io/) (navbar)        |
| Agent view  | [react-markdown](https://github.com/remarkjs/react-markdown)                                                  |
| Animation   | [react-type-animation](https://www.npmjs.com/package/react-type-animation), CSS transitions, `IntersectionObserver` |
| Linting     | [ESLint](https://eslint.org/) (flat config, React Hooks plugin)                                               |
| Hosting     | [Netlify](https://www.netlify.com/) — static files + two Edge Functions                                        |

## 🧭 How the site is organised

- **`src/data/portfolio.js`** — the single source of truth. Every fact the site shows (profile, experience, projects, skills, education, certificates, photos, metadata) lives here once.
- **Human view** — the React components read from `portfolio`.
- **Agent view** — the `Human | Agent` pill (or `?view=agent` on any URL) renders the same data as a markdown document (`src/lib/markdown.js`).
- **Build-time derivation** — `scripts/generate-agent-assets.mjs` runs after `vite build` and writes, from the same data:
  - `dist/_md/**.md` — served for `Accept: text/markdown` by `netlify/edge-functions/markdown-negotiation.ts`
  - `/llms.txt`, `/api/profile.json`, `/api/projects.json`, `/api/projects/<slug>.json`
  - `/.well-known/api-catalog` (RFC 9727, served by `netlify/edge-functions/api-catalog.ts`), `/.well-known/ard.json` (+ legacy `ai-catalog.json`), `/.well-known/agent-skills/index.json` + `SKILL.md`
  - `_redirects` (explicit routes + real 404) and `sitemap.xml`
- **Head metadata** — `index.html` carries a `<!--%PORTFOLIO_HEAD%-->` placeholder that the `portfolioHead` plugin in `vite.config.js` fills from the data; `src/hooks/useRouteMeta.js` updates title/description/canonical per route.
- **Static Netlify config** — `netlify.toml`, `public/_headers`, `public/robots.txt`, `public/404.html`.

## 🚀 Getting started

```sh
npm install
npm run dev        # Vite dev server (http://localhost:5173) — no redirects/headers/edge functions
```

To run the site exactly as Netlify serves it (redirects, headers, edge functions):

```sh
npm install -g netlify-cli
netlify serve      # builds, then serves dist/ at http://localhost:8888
```

## 📦 Build & verify

```sh
npm run build      # vite build + generate-agent-assets → dist/
npm run lint       # eslint
npm run verify     # with `netlify serve` running: every route on hard refresh + the game-mode checklist
```

Quick manual checks against a running server:

```sh
curl -H "Accept: text/markdown" http://localhost:8888/          # markdown for agents
curl -sI http://localhost:8888/this-does-not-exist               # real 404
curl -s http://localhost:8888/.well-known/api-catalog            # RFC 9727 linkset
```

## ✏️ Editing content

Change `src/data/portfolio.js` only. The React UI, the agent view, `llms.txt`, the JSON API, the discovery files, the sitemap and the head metadata all follow on the next build. Icons for projects and certificates are mapped by `slug` in `src/components/Projects.jsx` and `src/data/certificates.js`.

Adding photos: drop the image in `public/assets/photography/`, optimise it with `node scripts/optimize-images.mjs`, and add an entry (with `width`/`height`) to `photography.photos` in `portfolio.js`.

## 📄 License

All rights reserved © Harsh Bafna.
