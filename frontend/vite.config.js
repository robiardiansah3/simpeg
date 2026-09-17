import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1025, // Compress files larger than 1KB
      deleteOriginFile: false
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1025,
      deleteOriginFile: false
    })
  ],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'leaflet-maps';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router') || id.includes('react-router-dom')) {
              return 'react-framework';
            }
            if (id.includes('lucide-react')) {
              return 'lucide-icons';
            }
            return 'vendor-libs';
          }
        }
      }
    }
  }
})
