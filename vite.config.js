import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5000,
    host: '0.0.0.0',
    strictPort: true,
    allowedHosts: ['.replit.dev', '.repl.co', '.replit.app'],
    hmr: {
      clientPort: 443,
      protocol: 'wss'
    }
  },
  preview: {
    port: 5000,
    host: '0.0.0.0',
    allowedHosts: ['.replit.dev', '.repl.co', '.replit.app']
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animations: ['framer-motion'],
          icons: ['react-icons']
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode)
  }
}))
