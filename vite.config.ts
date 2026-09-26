import fs from 'node:fs'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * Dev-only listing of `examples/*.json`, so the editor can offer a quick switch
 * between the starter document and personal copies kept out of git.
 *
 * `apply: 'serve'` means this never runs at build time and the files are never
 * bundled — personal data cannot leak into `dist/`.
 */
function localProfiles(): Plugin {
  return {
    name: 'local-profiles',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__profiles', (_req, res) => {
        const dir = path.resolve(import.meta.dirname, 'examples')
        let files: string[] = []
        try {
          files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
        } catch {
          // No examples directory: the switcher just shows the starter.
        }
        const profiles = files.map((file) => ({
          file,
          label: file.replace(/\.local\.json$|\.json$/, ''),
          doc: JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')),
        }))
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify(profiles))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localProfiles()],
  // The typst wasm bundles ship as plain .mjs + .wasm pairs. Let Vite serve the
  // wasm as an asset URL instead of trying to pre-bundle it.
  optimizeDeps: {
    exclude: ['@myriaddreamin/typst-ts-web-compiler', '@myriaddreamin/typst-ts-renderer'],
  },
})
