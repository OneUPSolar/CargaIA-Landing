import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        ibero: 'ibero.html',
        privacy: 'privacy.html',
        terms: 'terms.html',
        mediakit: 'mediakit/index.html',
      },
    },
  },
})
