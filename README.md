# Résumé builder (Typst in the browser)

A local resume builder that produces the same output as the original Overleaf
LaTeX resume — without installing LaTeX. Typst is compiled to WebAssembly and
runs entirely in the browser: no server, no CDN calls at compile time.

```
pnpm install
pnpm dev             # editor at http://localhost:5173
pnpm build           # static bundle in dist/
pnpm check:template  # compile the template headlessly (no browser)
```

## How it works

```
resume.json (data, edited in the UI)
        +                              ──►  typst-ts-web-compiler (WASM)  ──►  SVG preview / PDF
src/typst/resume.typ (template)
```

- `src/typst/resume.typ` is a plain Typst file. It reads its content from
  `resume.json`, which the app injects as a shadow file before every compile, so
  no user text is ever interpolated into template source — no escaping bugs.
- `src/data/defaultResume.json` is the starter document shown on first run and
  restored by **Reset**. It is plain JSON on purpose — edit it directly, no ids
  needed; `normalizeResume` fills in anything left out and assigns ids at load.
- `src/types.ts` defines the JSON shape. **Renaming a field there means renaming
  it in `resume.typ` too** — that file is the contract.
- Fonts (New Computer Modern, the Typst equivalent of LaTeX's Computer Modern)
  are self-hosted in `public/fonts/` and preloaded, with the default remote font
  bundle disabled. Nothing is installed on the machine and nothing is fetched
  from Google Fonts; Typst embeds the faces into the PDF, so it renders the same
  on a machine that has never seen the font.

## Stack

| Piece | Why |
|---|---|
| `@myriaddreamin/typst.ts` | Typst compiler + renderer as WASM |
| `@tanstack/react-query` | Caches and dedupes compiles, keyed on the document |
| `@tanstack/store` | Document state, undo/redo, localStorage autosave |
| Tailwind v4 | Editor chrome |

The compiler WASM is ~28 MB (~11 MB gzipped). It is fetched once and then
browser-cached; compiles after that are ~100 ms for this document.

## Editing

- Every list — sections, bullets, entries, projects — has a ⠿ drag handle to
  reorder, **+** to insert a sibling directly below, and ✕ to delete.
- Hovering the gap between two sections reveals an **+ section** strip that
  inserts at that position.
- Sections can be toggled off without deleting them (the `on` checkbox).
- Undo/redo covers every edit. State autosaves to localStorage.

- Projects take optional **Repo URL** and **Live URL**. Each one renders a
  clickable icon (GitHub mark, globe) beside the project name in the PDF; leave
  a field blank and its icon disappears.

| Shortcut | |
|---|---|
| `Ctrl+S` | Save to the linked file |
| `Ctrl+Z` / `Ctrl+Shift+Z` | Undo / redo |

## Deploying to Cloudflare

The compiler wasm is ~27 MiB and Cloudflare caps static assets at **25 MiB per
file**, so a plain `pnpm build` cannot be deployed as-is:

```
Asset too large. Cloudflare Workers supports assets with sizes of up to 25 MiB.
```

The Cloudflare build loads that one file from jsDelivr instead of bundling it:

```
pnpm build:cf   # vite build --mode cloudflare
pnpm deploy     # build:cf, then wrangler deploy
```

`--mode cloudflare` loads `.env.cloudflare`, which sets
`VITE_TYPST_COMPILER_WASM_URL`. That constant folds at build time, so the
bundled import in `src/typst/engine.ts` becomes dead code and the 27 MiB file is
never emitted — the largest asset in `dist/` drops to under 1 MiB. Fonts and the
renderer wasm stay local, so only the first compile of a session reaches the
network.

Building through Cloudflare's git integration instead of the CLI? Set the build
command to `pnpm run build:cf` and the output directory to `dist`. Setting
`VITE_TYPST_COMPILER_WASM_URL` as a dashboard build variable works too — Vite
picks up prefixed variables from the environment.

`pnpm build` deliberately keeps the wasm bundled, so self-hosted and local
builds stay fully offline.

## Theming

Dark by default, toggled from the toolbar and remembered in localStorage. The
palette lives entirely in `src/index.css`: semantic tokens (`--color-surface`,
`--color-ink`, …) map to a `--c-*` set that `:root` and `html.light` swap.
Components only ever use token names, so a new theme is one block of variables.

The preview is deliberately exempt. Typst emits glyphs with
`fill: var(--glyph_fill)`, so the `.paper` class pins that to black and forces
`color-scheme: light` — the sheet stays exactly what the PDF will be, whatever
the app theme is.

## Saving into a git repo

**Link file…** (or **Open file…**) uses the File System Access API to bind the
app to a real `resume.json` on disk — put it inside a git clone and `Ctrl+S`
writes straight into the working tree, then commit as usual. The handle is kept
in IndexedDB, so the link survives reloads; the browser re-asks for write
permission once per session.

Chromium-only. Everywhere else, fall back to **Export JSON** / **Import JSON**.

## Starting from an existing CV

**✦ From existing CV** shows a prompt to paste into ChatGPT/Claude along with a
current résumé. The model returns JSON, which goes in the box below it.

The importer (`src/lib/normalize.ts`) is deliberately forgiving: it strips code
fences, fills missing fields with defaults, generates ids, and drops sections it
does not recognise rather than failing the import.

## Layout fidelity

`config` in the document mirrors the LaTeX preamble:

| Config | LaTeX original |
|---|---|
| `margin` 0.5 / 0.375 / 0.5 / 0.625 in | `fullpage` + `oddsidemargin -0.375in`, `topmargin -0.5in` |
| `fontSize` 10pt | `\documentclass[a4]{article}` |
| `itemSize` 9pt | `\small` inside `\resumeItem` |
| `nameSize` 14.4pt | `\Large` |
| `headingSize` 12pt | `\large` in `\titleformat{\section}` |
| no justification | `\raggedright` |

All of these are editable in the Layout panel.
