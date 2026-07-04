import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Exclude non-frontend folders from Vite's file watcher
      // so Python scripts, notebooks, and outputs don't crash the HMR server
      ignored: [
        '**/code/**',
        '**/jupyter_notebook/**',
        '**/output/**',
        '**/__pycache__/**',
        '**/*.pkl',
        '**/*.graphml',
        '**/Data Set/**',
        '**/*.ipynb',
      ],
    },
  },
  build: {
    outDir: 'dist',
    // Silence the chunk-size warning — leaflet + recharts are expected to be large
    chunkSizeWarningLimit: 1200,
  },
})
