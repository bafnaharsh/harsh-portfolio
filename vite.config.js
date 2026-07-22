import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
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
          return 'vendor';
        },
      },
    },
  },
})
