import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
  },
  build: {
    // Build straight into the static site's root, alongside the other
    // hand-authored pages (landing.html, approach.html, etc). We only ever
    // emit workspace.html plus a hashed assets/ bundle, so this never
    // touches the rest of the site.
    outDir: '../',
    emptyOutDir: false,
    rollupOptions: {
      input: 'workspace.html',
    },
  },
})
