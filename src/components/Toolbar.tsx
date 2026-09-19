import { useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { downloadJson, downloadPdf, pickJson } from '../lib/files'
import { fsSupported } from '../lib/fileSystem'
import { fileStore, linkNewFile, openFile, save, unlink } from '../store/file'
import { historyStore, redo, replaceResume, resetResume, undo } from '../store/resume'
import { themeStore, toggleTheme } from '../store/theme'
import type { Resume } from '../types'
import { Logo } from './Logo'
import { Btn } from './ui'

export function Toolbar({
  resume,
  zoom,
  setZoom,
  onStartFromCv,
}: {
  resume: Resume
  zoom: number
  setZoom: (z: number) => void
  onStartFromCv: () => void
}) {
  const { canUndo, canRedo } = useStore(historyStore)
  const file = useStore(fileStore)
  const theme = useStore(themeStore)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function savePdf() {
    setBusy(true)
    setError(null)
    try {
      await downloadPdf(resume)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  async function importJson() {
    setError(null)
    try {
      replaceResume(await pickJson())
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const suggestedName = `${resume.header.name.trim().replace(/\s+/g, '_') || 'resume'}.json`

  return (
    <header className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-4 py-2.5">
      <h1 className="mr-1 flex items-center gap-2 text-sm font-semibold tracking-tight text-ink">
        <Logo className="h-[22px] w-[22px] rounded-[5px]" />
        Résumé<span className="font-normal text-faint">· typst</span>
      </h1>

      <Btn onClick={undo} disabled={!canUndo} data-tip="Undo (Ctrl+Z)">
        ↶
      </Btn>
      <Btn onClick={redo} disabled={!canRedo} data-tip="Redo (Ctrl+Shift+Z)">
        ↷
      </Btn>

      <span className="mx-1 h-4 w-px bg-line" />

      {fsSupported &&
        (file.name ? (
          <>
            <span
              className="flex items-center gap-1.5 rounded-md bg-raised px-2 py-1 text-xs text-dim"
              data-tip={file.dirty ? 'Unsaved changes' : 'Saved'}
            >
              <span className={file.dirty ? 'text-amber-400' : 'text-emerald-400'}>●</span>
              {file.name}
            </span>
            <Btn variant="solid" onClick={() => save()} data-tip="Save to file (Ctrl+S)">
              Save
            </Btn>
            <Btn onClick={unlink}>Unlink</Btn>
          </>
        ) : (
          <>
            <Btn onClick={openFile}>Open file…</Btn>
            <Btn onClick={() => linkNewFile(suggestedName)}>Link file…</Btn>
          </>
        ))}

      <span className="mx-1 h-4 w-px bg-line" />

      <Btn onClick={onStartFromCv}>✦ From existing CV</Btn>
      <Btn onClick={importJson}>Import JSON</Btn>
      <Btn onClick={() => downloadJson(resume)}>Export JSON</Btn>
      <Btn
        onClick={() => {
          if (confirm('Reset to the starter resume? Your edits can still be undone.')) {
            resetResume()
          }
        }}
      >
        Reset
      </Btn>

      <span className="mx-1 h-4 w-px bg-line" />

      <div className="flex items-center gap-1">
        <Btn onClick={() => setZoom(Math.max(0.25, zoom - 0.1))} aria-label="Zoom out">
          −
        </Btn>
        <span className="w-11 text-center text-xs tabular-nums text-dim">
          {Math.round(zoom * 100)}%
        </span>
        <Btn onClick={() => setZoom(Math.min(2, zoom + 0.1))} aria-label="Zoom in">
          +
        </Btn>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {(error ?? file.error) && (
          <span className="max-w-xs truncate text-xs text-danger">{error ?? file.error}</span>
        )}
        <Btn
          onClick={toggleTheme}
          data-tip={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☾' : '☀'}
        </Btn>
        <Btn variant="solid" onClick={savePdf} disabled={busy}>
          {busy ? 'Compiling…' : '↓ Download PDF'}
        </Btn>
      </div>
    </header>
  )
}
