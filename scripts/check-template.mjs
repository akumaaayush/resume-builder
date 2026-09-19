/**
 * Dev-only sanity check: compiles the Typst template against the seed resume
 * using the native Node compiler, so template errors surface without booting
 * the browser/WASM stack.
 *
 *   pnpm check:template
 */
import fs from 'node:fs'
import path from 'node:path'
import { NodeCompiler } from '@myriaddreamin/typst-ts-node-compiler'

const root = path.resolve(import.meta.dirname, '..')
const work = path.join(root, '.typst-check')

fs.mkdirSync(work, { recursive: true })
fs.copyFileSync(path.join(root, 'src/typst/resume.typ'), path.join(work, 'resume.typ'))
fs.cpSync(path.join(root, 'src/typst/icons'), path.join(work, 'icons'), { recursive: true })
// The template reads plain data and never touches ids, so the seed JSON can go
// to the compiler exactly as it sits on disk.
const seed = JSON.parse(fs.readFileSync(path.join(root, 'src/data/defaultResume.json'), 'utf8'))

fs.writeFileSync(path.join(work, 'resume.json'), JSON.stringify(seed, null, 2))

const compiler = NodeCompiler.create({
  workspace: work,
  fontArgs: [{ fontPaths: [path.join(root, 'public/fonts')] }],
})

try {
  const pdf = compiler.pdf({ mainFilePath: path.join(work, 'resume.typ') })
  if (!pdf) {
    console.error('compile returned no pdf')
    process.exit(1)
  }
  const outFile = path.join(work, 'resume.pdf')
  fs.writeFileSync(outFile, pdf)
  console.log(`ok: ${pdf.length} bytes -> ${outFile}`)
} catch (err) {
  console.error('compile failed:')
  console.error(err?.message ?? err)
  process.exit(1)
}
