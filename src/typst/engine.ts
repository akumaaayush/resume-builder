import { $typst } from '@myriaddreamin/typst.ts'
import { TypstSnippet } from '@myriaddreamin/typst.ts/contrib/snippet'
import compilerWasm from '@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url'
import rendererWasm from '@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm?url'
import templateSource from './resume.typ?raw'
import githubIcon from './icons/github.svg?raw'
import globeIcon from './icons/globe.svg?raw'
import type { Resume } from '../types'

const MAIN_PATH = '/resume.typ'
const DATA_PATH = '/resume.json'

/** Icons the template references by path; injected into the compiler VFS. */
const ICONS: [string, string][] = [
  ['/icons/github.svg', githubIcon],
  ['/icons/globe.svg', globeIcon],
]

/** Self-hosted so a compile never depends on the network. */
const FONT_FILES = [
  'NewCM10-Regular.otf',
  'NewCM10-Bold.otf',
  'NewCM10-Italic.otf',
  'NewCM10-BoldItalic.otf',
  'NewCMMono10-Regular.otf',
  'NewCMMono10-Bold.otf',
]

const fontUrls = FONT_FILES.map((f) => `${import.meta.env.BASE_URL}fonts/${f}`)

let bootstrap: Promise<void> | undefined

function init(): Promise<void> {
  bootstrap ??= (async () => {
    $typst.setCompilerInitOptions({ getModule: () => compilerWasm })
    $typst.setRendererInitOptions({ getModule: () => rendererWasm })
    // Skip the CDN-hosted default font bundle; we ship exactly what the
    // template asks for.
    $typst.use(TypstSnippet.disableDefaultFontAssets(), TypstSnippet.preloadFonts(fontUrls))
    await $typst.getCompiler()
  })()
  return bootstrap
}

/** `$typst` is a single stateful instance, so compiles must not interleave. */
let tail: Promise<unknown> = Promise.resolve()

function enqueue<T>(job: () => Promise<T>): Promise<T> {
  const run = tail.then(job, job)
  tail = run.catch(() => undefined)
  return run
}

async function stage(resume: Resume): Promise<void> {
  await init()
  const encoder = new TextEncoder()
  await $typst.addSource(MAIN_PATH, templateSource)
  for (const [path, svg] of ICONS) {
    await $typst.mapShadow(path, encoder.encode(svg))
  }
  await $typst.mapShadow(DATA_PATH, encoder.encode(JSON.stringify(resume)))
}

function describe(err: unknown): Error {
  if (err instanceof Error) return err
  if (typeof err === 'string') return new Error(err)
  return new Error(JSON.stringify(err))
}

export async function compileSvg(resume: Resume): Promise<string> {
  return enqueue(async () => {
    await stage(resume)
    try {
      return await $typst.svg({ mainFilePath: MAIN_PATH })
    } catch (err) {
      throw describe(err)
    }
  })
}

export async function compilePdf(resume: Resume): Promise<Uint8Array> {
  return enqueue(async () => {
    await stage(resume)
    try {
      const bytes = await $typst.pdf({ mainFilePath: MAIN_PATH })
      if (!bytes) throw new Error('compiler produced no PDF')
      return bytes
    } catch (err) {
      throw describe(err)
    }
  })
}

/** The template source, exposed so the UI can show/export it. */
export const typstTemplate = templateSource
