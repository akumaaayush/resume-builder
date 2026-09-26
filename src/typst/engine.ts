import { $typst } from '@myriaddreamin/typst.ts'
import { TypstSnippet } from '@myriaddreamin/typst.ts/contrib/snippet'
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

/**
 * The compiler wasm is ~27 MiB, which is over Cloudflare's 25 MiB per-file cap
 * for static assets. Setting VITE_TYPST_COMPILER_WASM_URL points the loader at
 * a CDN copy instead; because the constant folds at build time, the bundled
 * import below becomes dead code and the file is never emitted into dist/.
 */
const compilerWasmOverride = import.meta.env.VITE_TYPST_COMPILER_WASM_URL

async function compilerModule(): Promise<string> {
  if (compilerWasmOverride) return compilerWasmOverride
  const mod = await import('@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url')
  return mod.default
}

let bootstrap: Promise<void> | undefined

function init(): Promise<void> {
  bootstrap ??= (async () => {
    const compilerWasm = await compilerModule()
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

/** Page-fit telemetry emitted by the template's `<resume-fit>` metadata. */
export interface PageFit {
  pages: number
  /** Height of content on the final page, in points. */
  usedOnLastPt: number
  /** Usable height of one page, in points. */
  usablePt: number
}

export interface CompiledDoc {
  svg: string
  fit: PageFit | null
}

interface FitMetadata {
  pages: number
  lastPage: number
  usedPt: number
  pageHeightPt: number
  topMarginPt: number
  bottomMarginPt: number
}

async function readFit(): Promise<PageFit | null> {
  try {
    // `$typst.query` snapshots an uncompiled world, so it fails with "document
    // is not compiled". Drive the world directly instead: compiling it again is
    // near-free because Typst's incremental cache is still warm from the
    // vector compile that just ran.
    const compiler = await $typst.getCompiler()
    const found = await compiler.runWithWorld({ mainFilePath: MAIN_PATH }, async (world) => {
      await world.compile()
      return (await world.query({ selector: '<resume-fit>', field: 'value' })) as FitMetadata[]
    })
    const m = found?.[0]
    if (!m) return null
    return {
      pages: m.pages,
      usedOnLastPt: Math.max(0, m.usedPt - m.topMarginPt),
      usablePt: m.pageHeightPt - m.topMarginPt - m.bottomMarginPt,
    }
  } catch (err) {
    // Telemetry is optional; never fail a render over it.
    console.warn('page-fit query failed', err)
    return null
  }
}

export async function compileDocument(resume: Resume): Promise<CompiledDoc> {
  return enqueue(async () => {
    await stage(resume)
    try {
      // One compile serves all three: `vector` compiles and retains the
      // document, `query` then reads the fit metadata off it for free, and the
      // SVG is rendered from the artifact rather than compiled a second time.
      const vector = await $typst.vector({ mainFilePath: MAIN_PATH })
      const fit = await readFit()
      const svg = await $typst.svg(vector ? { vectorData: vector } : { mainFilePath: MAIN_PATH })
      return { svg, fit }
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
