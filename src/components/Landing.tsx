import { useStore } from '@tanstack/react-store'
import { themeStore, toggleTheme } from '../store/theme'
import { Logo } from './Logo'

const REPO_URL = 'https://github.com/akumaaayush/resume-builder'

const POINTS = [
  'Real Typst typesetting in Computer Modern, the LaTeX look as a real PDF.',
  'Runs entirely in your browser. No account, no upload, nothing leaves the tab.',
  'Already have a CV? Paste it through ChatGPT once and import the result.',
]

export function Landing({ onOpen }: { onOpen: () => void }) {
  const theme = useStore(themeStore)

  return (
    // One viewport, no scrolling: the hero is clipped rather than making the
    // page taller.
    <div className="editor-pane flex h-screen flex-col overflow-hidden bg-canvas">
      <nav className="shrink-0 border-b border-line/70 bg-surface/60 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2.5 px-6">
          <Logo className="h-6 w-6 rounded-[6px]" />
          <span className="text-sm font-semibold tracking-tight text-ink">Résumé Builder</span>

          <div className="ml-auto flex items-center gap-1">
            {/* <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-md px-3 py-1.5 text-xs font-medium text-dim transition hover:bg-ink/5 hover:text-ink"
            >
              Source
            </a> */}
            <button
              type="button"
              onClick={toggleTheme}
              data-tip-pos="bottom"
              data-tip={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
              aria-label="Toggle theme"
              className="rounded-md px-2.5 py-1.5 text-xs text-dim transition hover:bg-ink/5 hover:text-ink"
            >
              {theme === 'dark' ? '☾' : '☀'}
            </button>
            <button
              type="button"
              onClick={onOpen}
              className="ml-1 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-accent-hi"
            >
              Open editor
            </button>
          </div>
        </div>
      </nav>

      <main className="flex min-h-0 flex-1 items-center">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1fr_minmax(0,420px)]">
          <div>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
              LaTeX résumés,
              <br />
              without LaTeX.
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-relaxed text-dim">
              A résumé editor that typesets the classic LaTeX template with Typst compiled to
              WebAssembly. Edit on the left, watch the real page redraw on the right, download the
              PDF.
            </p>

            <ul className="mt-7 flex max-w-lg flex-col gap-2.5">
              {POINTS.map((point) => (
                <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-dim">
                  <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onOpen}
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:bg-accent-hi"
              >
                Open the editor →
              </button>
              <span className="text-xs text-faint">Free · nothing to install</span>
            </div>
          </div>

          {/* The hero is the actual starter document, rendered from the same
              template the editor compiles. Clipped and faded at the bottom so
              it reads as a page continuing past the fold. */}
          <div className="relative hidden lg:block">
            <div className="relative mx-auto max-h-[min(66vh,560px)] w-full overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-black/10">
              <img
                src={`${import.meta.env.BASE_URL}resume-preview.webp`}
                alt="Preview of the starter résumé"
                width={1191}
                height={1684}
                className="block w-full"
                loading="eager"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
