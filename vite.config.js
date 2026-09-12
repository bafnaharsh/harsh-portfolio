import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { staticHeadHtml } from './src/lib/seo.js'

// Injects the <head> metadata block (title, description, canonical, Open
// Graph, Twitter, Person JSON-LD) into index.html from src/data/portfolio.js,
// so the identity facts crawlers see without JavaScript come from the same
// single source of truth as the rest of the site.
const portfolioHead = () => ({
  name: 'portfolio-head',
  transformIndexHtml(html) {
    if (!html.includes('<!--%PORTFOLIO_HEAD%-->')) {
      throw new Error('index.html is missing the <!--%PORTFOLIO_HEAD%--> placeholder')
    }
    return html.replace('<!--%PORTFOLIO_HEAD%-->', staticHeadHtml())
  },
})

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), portfolioHead()],
  server: {
    host: true,
    port: 5173
  },
    build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Split heavy, stable vendor libraries into their own long-cached
        // chunks so app code changes don't invalidate them.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
            return 'react-vendor';
          }
          if (/[\\/]node_modules[\\/](@mui|@emotion)[\\/]/.test(id)) {
            return 'mui';
          }
          if (/[\\/]node_modules[\\/](react-bootstrap|bootstrap|@restart)[\\/]/.test(id)) {
            return 'bootstrap';
          }
          // Everything else (react-markdown and its parser chain, small
          // utilities) is left to the bundler so lazily-imported features
          // keep their dependencies in their own lazy chunk instead of
          // inflating the initial page load.
          return undefined;
        },
      },
    },
  },
})
