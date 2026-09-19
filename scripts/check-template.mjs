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
import { defaultResume } from '../src/data/defaultResume.ts'

const root = path.resolve(import.meta.dirname, '..')
const work = path.join(root, '.typst-check')

fs.mkdirSync(work, { recursive: true })
fs.copyFileSync(path.join(root, 'src/typst/resume.typ'), path.join(work, 'resume.typ'))
fs.cpSync(path.join(root, 'src/typst/icons'), path.join(work, 'icons'), { recursive: true })
// Exercise the optional project icon links, which the seed leaves blank.
const fixture = structuredClone(defaultResume)
for (const section of fixture.sections) {
  if (section.kind === 'projects' && section.items[0]) {
    section.items[0].repoUrl = 'https://github.com/example/repo'
    section.items[0].liveUrl = 'https://example.com'
  }
}

fs.writeFileSync(path.join(work, 'resume.json'), JSON.stringify(fixture, null, 2))

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
