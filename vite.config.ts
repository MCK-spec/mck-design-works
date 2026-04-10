import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    host: true,
    open: true,
    strictPort: true,
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001'
    },
    hmr: {
      overlay: false
    }
  }
})
