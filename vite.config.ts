import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The typst wasm bundles ship as plain .mjs + .wasm pairs. Let Vite serve the
  // wasm as an asset URL instead of trying to pre-bundle it.
  optimizeDeps: {
    exclude: ['@myriaddreamin/typst-ts-web-compiler', '@myriaddreamin/typst-ts-renderer'],
  },
})
