import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      // Proxy pour contourner CORS en développement
      '/api': {
        target: process.env.VITE_API_URL || 'https://crm-backend-production-f0c8.up.railway.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ Proxy error:', err)
          })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🔄 Proxying:', req.method, req.url, '→', proxyReq.path)
          })
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          forms: ['react-hook-form', 'react-select', 'react-datepicker'],
          utils: ['axios', 'date-fns', 'js-cookie']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})