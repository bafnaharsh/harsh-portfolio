# Harsh Bafna — Portfolio

Personal portfolio of **Harsh Bafna**, Machine Learning Engineer specializing
in generative AI, multi-agent systems, and production-grade LLM applications.

🔗 **Live site:** [harshbafna.netlify.app](https://harshbafna.netlify.app)

---

## 🛠️ Tech stack

| Layer      | Choice                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| Build tool | [Vite](https://vitejs.dev/)                                                                                         |
| UI library | [React 19](https://react.dev/)                                                                                      |
| Routing    | [react-router-dom](https://reactrouter.com/)                                                                        |
| Components | [MUI](https://mui.com/) (icons, Tabs) + [react-bootstrap](https://react-bootstrap.github.io/) (navbar)              |
| Animation  | [react-type-animation](https://www.npmjs.com/package/react-type-animation), CSS transitions, `IntersectionObserver` |
| Linting    | [ESLint](https://eslint.org/) (flat config, React Hooks plugin)                                                     |
| Hosting    | [Netlify](https://www.netlify.com/)                                                                                 |

## 📁 Project structure

```
src/
  components/   # One component per section/feature (PascalCase.jsx)
  data/         # Centralized content: certificates.js, photos.js
  styles/       # One stylesheet per component (PascalCase.css)
  assets/       # Pre-computed ASCII portrait data
public/
  assets/       # Images (photography, about photo)
  certs/        # Certificate PDFs
  sitemap.xml, robots.txt, manifest.json, _redirects
```

## 🚀 Getting started

```sh
npm install
npm run dev       # start the local dev server (http://localhost:5173)
```

## 📦 Build & preview

```sh
npm run build      # production build → dist/
npm run preview    # preview the production build locally
```

## 🖼️ Preview

<!-- Add a screenshot or GIF of the homepage here, e.g.: -->
<!-- ![Portfolio preview](public/assets/preview.png) -->

## 📄 License

All rights reserved © Harsh Bafna.
