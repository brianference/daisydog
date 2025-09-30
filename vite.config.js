import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      clientPort: 443,
      protocol: 'wss'
    }
  },
  preview: {
    port: 5000,
    host: '0.0.0.0'
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        chunkSizeWarningLimit: 1000,
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animations: ['framer-motion'],
          icons: ['react-icons']
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})
