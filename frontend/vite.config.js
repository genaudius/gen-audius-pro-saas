import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['00fwp.app.super.myninja.ai', '00iow.app.super.myninja.ai', '.super.myninja.ai', 'localhost'],
    strictPort: true,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
    proxy: {
      // Proxy para kie.ai API — evita CORS en desarrollo
      '/api/kie': {
        target: 'https://api.kie.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/kie/, ''),
        secure: true,
      },
      '/api/backend': {
        target: 'http://127.0.0.1:8005',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/backend/, ''),
        secure: false,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['00fwp.app.super.myninja.ai', '00iow.app.super.myninja.ai', '.super.myninja.ai', 'localhost'],
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  },
})
