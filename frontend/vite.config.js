import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Add the PSD files as assets
  assetsInclude: ['**/*.psd'],

  // Server settings with proxy for API requests
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // Proxy API requests to your backend server during development
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },

  plugins: [react()],
})