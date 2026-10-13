import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        ws: true,
        configure: (proxy) => {
          proxy.on('error', (err: any) => {
            // Suppress normal WebSocket disconnects / tab refresh aborts
            if (['ECONNABORTED', 'ECONNRESET', 'EPIPE'].includes(err?.code)) {
              return
            }
            console.warn('[vite ws proxy]:', err?.message || err)
          })
          proxy.on('proxyReqWs', (_proxyReq, _req, socket: any) => {
            socket.on('error', (err: any) => {
              if (['ECONNABORTED', 'ECONNRESET', 'EPIPE'].includes(err?.code)) {
                return
              }
              console.warn('[vite ws socket]:', err?.message || err)
            })
          })
        },
      },
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
})
