import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { ConfigPanel } from './components/ConfigPanel'
import { HeaderEditor } from './components/HeaderEditor'
import { ImportDialog } from './components/ImportDialog'
import { Preview } from './components/Preview'
import { SectionEditor } from './components/SectionEditor'
import { SortableList, SortableRow } from './components/Sortable'
import { Toolbar } from './components/Toolbar'
import { Btn } from './components/ui'
import { useDebounced } from './lib/hooks'
import { restoreLink, save } from './store/file'
import { addSection, redo, reorderSections, resumeStore, undo } from './store/resume'
import type { SectionKind } from './types'

const NEW_SECTION: { kind: SectionKind; label: string }[] = [
  { kind: 'bullets', label: 'Bullet list' },
  { kind: 'timeline', label: 'Timeline' },
  { kind: 'projects', label: 'Projects' },
  { kind: 'labeled', label: 'Labeled list' },
]

export default function App() {
  const resume = useStore(resumeStore)
  // Typst compiles this document in ~100ms, but debouncing keeps typing smooth
  // and stops the compile queue from backing up.
  const debounced = useDebounced(resume, 300)
  const [zoom, setZoom] = useState(0.9)
  const [splitPct, setSplitPct] = useState(42)
  const [importing, setImporting] = useState(false)
  const dragging = useRef(false)

  useEffect(() => {
    void restoreLink()
  }, [])

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
    <div className="flex h-screen flex-col bg-raised">
      <Toolbar
        resume={resume}
        zoom={zoom}
        setZoom={setZoom}
        onStartFromCv={() => setImporting(true)}
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

            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-line p-3">
              <span className="text-[10px] font-medium uppercase tracking-wider text-dim">
                Add section
              </span>
              {NEW_SECTION.map((s) => (
                <Btn key={s.kind} onClick={() => addSection(s.kind)}>
                  + {s.label}
                </Btn>
              ))}
            </div>

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
          <Preview resume={debounced} zoom={zoom} />
        </div>
      </div>

      {importing && <ImportDialog onClose={() => setImporting(false)} />}
    </div>
  )
}

/** Hover strip between sections: drops a new section at this position. */
function SectionInserter({ at }: { at: number }) {
  const [open, setOpen] = useState(false)

  if (open) {
    return (
      <div className="flex flex-wrap items-center gap-1 rounded-md border border-line bg-surface p-1.5 shadow-sm">
        {NEW_SECTION.map((s) => (
          <Btn
            key={s.kind}
            onClick={() => {
              addSection(s.kind, at)
              setOpen(false)
            }}
          >
            + {s.label}
          </Btn>
        ))}
        <Btn variant="danger" onClick={() => setOpen(false)} aria-label="Cancel">
          ✕
        </Btn>
      </div>
    )
  }

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
