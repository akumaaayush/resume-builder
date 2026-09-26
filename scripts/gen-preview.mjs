/**
 * Renders page 1 of the starter resume to `public/resume-preview.webp`, used as
 * the landing page hero. Generated from the same template the app compiles, so
 * the marketing shot cannot drift from the product.
 *
 *   pnpm gen:preview
 *
 * The output is committed: Cloudflare's build image has no native Typst
 * compiler, and the landing page must not pull the 27 MiB wasm to show a
 * picture. Rasterising needs Python with `pypdfium2` and `pillow`
 * (`pip install pypdfium2 pillow`) — the compiler's `plainSvg` output draws
 * glyphs through <symbol>/<use>, which browsers render blank here.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { NodeCompiler } from '@myriaddreamin/typst-ts-node-compiler'

const root = path.resolve(import.meta.dirname, '..')
const work = path.join(root, '.typst-check', 'preview')

fs.mkdirSync(work, { recursive: true })
fs.copyFileSync(path.join(root, 'src/typst/resume.typ'), path.join(work, 'resume.typ'))
fs.cpSync(path.join(root, 'src/typst/icons'), path.join(work, 'icons'), { recursive: true })
fs.copyFileSync(path.join(root, 'src/data/defaultResume.json'), path.join(work, 'resume.json'))

const compiler = NodeCompiler.create({
  workspace: work,
  fontArgs: [{ fontPaths: [path.join(root, 'public/fonts')] }],
})

const pdfPath = path.join(work, 'preview.pdf')
fs.writeFileSync(pdfPath, compiler.pdf({ mainFilePath: path.join(work, 'resume.typ') }))

const out = path.join(root, 'public/resume-preview.webp')
const script = `
import pypdfium2 as pdfium
pdf = pdfium.PdfDocument(r"${pdfPath}")
img = pdf[0].render(scale=2).to_pil().convert("RGB")
img.save(r"${out}", "WEBP", quality=88, method=6)
print(img.size[0], img.size[1])
`

const size = execFileSync('python', ['-c', script], { encoding: 'utf8' }).trim()
console.log(`ok: ${size} px, ${(fs.statSync(out).size / 1024).toFixed(0)} kB -> public/resume-preview.webp`)
