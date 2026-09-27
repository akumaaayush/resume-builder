import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { ConfigPanel } from './components/ConfigPanel'
import { HeaderEditor } from './components/HeaderEditor'
import { ImportDialog } from './components/ImportDialog'
import { Preview } from './components/Preview'
import { SectionEditor } from './components/SectionEditor'
import { SectionPicker } from './components/SectionPicker'
import { SortableList, SortableRow } from './components/Sortable'
import { Toolbar } from './components/Toolbar'
import { useCompiledDoc, useDebounced } from './lib/hooks'
import { restoreLink, save } from './store/file'
import { redo, reorderSections, resumeStore, undo } from './store/resume'

const ZOOM_KEY = 'resume-builder:zoom'

function initialZoom(): number {
  try {
    const saved = Number(localStorage.getItem(ZOOM_KEY))
    if (saved >= 0.25 && saved <= 2) return saved
  } catch {
    // Private mode or blocked storage: fall through to the default.
  }
  return 0.9
}

export default function App({ onHome }: { onHome: () => void }) {
  const resume = useStore(resumeStore)
  // Typst compiles this document in ~100ms, but debouncing keeps typing smooth
  // and stops the compile queue from backing up.
  const debounced = useDebounced(resume, 300)
  const { data, error, isFetching, isPending } = useCompiledDoc(debounced)

  const [zoom, setZoom] = useState(initialZoom)
  const [splitPct, setSplitPct] = useState(42)
  const [importing, setImporting] = useState(false)
  const dragging = useRef(false)

  useEffect(() => {
    void restoreLink()
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(ZOOM_KEY, String(zoom))
    } catch {
      // Not worth surfacing: the zoom simply resets next session.
    }
  }, [zoom])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey)) return
      const key = e.key.toLowerCase()
      if (key === 's') {
        e.preventDefault()
        void save()
      } else if (key === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      } else if (key === 'y') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onDrag = useCallback((e: MouseEvent) => {
    if (!dragging.current) return
    setSplitPct(Math.min(70, Math.max(25, (e.clientX / window.innerWidth) * 100)))
  }, [])

  useEffect(() => {
    const stop = () => {
      dragging.current = false
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onDrag)
    window.addEventListener('mouseup', stop)
    return () => {
      window.removeEventListener('mousemove', onDrag)
      window.removeEventListener('mouseup', stop)
    }
  }, [onDrag])

  return (
    <div className="flex h-screen flex-col bg-canvas">
      <Toolbar
        resume={resume}
        zoom={zoom}
        setZoom={setZoom}
        onStartFromCv={() => setImporting(true)}
        onHome={onHome}
        fit={data?.fit}
        fitStale={isFetching}
      />

      <div className="flex min-h-0 flex-1">
        <div className="editor-pane min-w-0 overflow-y-auto p-4" style={{ width: `${splitPct}%` }}>
          <div className="flex flex-col gap-3">
            <HeaderEditor header={resume.header} />

            <SortableList ids={resume.sections.map((s) => s.id)} onReorder={reorderSections}>
              <div className="flex flex-col gap-3">
                {resume.sections.map((section, i) => (
                  <SortableRow key={section.id} id={section.id} className="flex flex-col gap-3">
                    {(handle) => (
                      <>
                        <SectionInserter at={i} />
                        <SectionEditor section={section} dragHandle={handle} />
                      </>
                    )}
                  </SortableRow>
                ))}
              </div>
            </SortableList>

            <AddSectionPanel />

            <ConfigPanel config={resume.config} />
          </div>
        </div>

        <div
          onMouseDown={() => {
            dragging.current = true
            document.body.style.userSelect = 'none'
          }}
          className="w-1.5 shrink-0 cursor-col-resize bg-line transition hover:bg-line-strong"
          role="separator"
          aria-orientation="vertical"
        />

        <div className="min-w-0 flex-1">
          <Preview
            svg={data?.svg}
            error={error}
            isFetching={isFetching}
            isPending={isPending}
            zoom={zoom}
          />
        </div>
      </div>

      {importing && <ImportDialog onClose={() => setImporting(false)} />}
    </div>
  )
}

/** Hover strip between sections: drops a new section at this position. */
function SectionInserter({ at }: { at: number }) {
  const [open, setOpen] = useState(false)

  if (open) return <SectionPicker at={at} onDone={() => setOpen(false)} />

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="-my-2 flex h-4 w-full items-center gap-2 opacity-0 transition hover:opacity-100 focus:opacity-100"
      aria-label="Insert section here"
    >
      <span className="h-px flex-1 bg-line" />
      <span className="rounded-full border border-line bg-surface px-2 py-0.5 text-[10px] text-dim">
        + section
      </span>
      <span className="h-px flex-1 bg-line" />
    </button>
  )
}

function AddSectionPanel() {
  const [open, setOpen] = useState(false)

  if (open) return <SectionPicker onDone={() => setOpen(false)} />

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="rounded-lg border border-dashed border-line p-3 text-xs font-medium text-dim transition hover:border-accent hover:text-ink"
    >
      + Add section
    </button>
  )
}
