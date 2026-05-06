import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // All requests to /gdacs-api will be forwarded to GDACS servers
      '/gdacs-api': {
        target: 'https://www.gdacs.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gdacs-api/, '/gdacsapi'),
        secure: true,
      },
    },
  },
})
