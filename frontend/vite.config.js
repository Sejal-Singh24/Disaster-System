import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // GDACS — Live global disaster data
      '/gdacs-api': {
        target: 'https://www.gdacs.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gdacs-api/, '/gdacsapi'),
        secure: true,
      },
      // OpenWeather — India state-level live weather & alerts
      '/openweather-api': {
        target: 'https://api.openweathermap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/openweather-api/, ''),
        secure: true,
      },
    },
  },
})