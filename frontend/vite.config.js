import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFile } from 'node:fs/promises'
import { defineConfig } from 'vite'

function offlineMapAssets() {
  return {
    name: 'offline-map-assets',
    apply: 'build',
    async generateBundle() {
      for (const fileName of ['sw.js', 'data/regionVI.json']) {
        const source = await readFile(new URL(`./public/${fileName}`, import.meta.url))
        this.emitFile({ type: 'asset', fileName, source })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), offlineMapAssets()],
  build: {
    manifest: "manifest.json",
    copyPublicDir: false,
  },
})
