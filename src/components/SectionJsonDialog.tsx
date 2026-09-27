import { useState } from 'react'
import { extractJson, stripIds } from '../lib/json'
import { normalizeSection } from '../lib/normalize'
import { replaceSection } from '../store/resume'
import type { Section } from '../types'
import { Btn, TextArea } from './ui'

/**
 * Copy one section out as JSON, or paste JSON back over it. Useful for moving a
 * section between documents, or keeping a couple of variants of the same
 * Experience block around.
 */
export function SectionJsonDialog({ section, onClose }: { section: Section; onClose: () => void }) {
  const exported = JSON.stringify(stripIds(section), null, 2)
  const [pasted, setPasted] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(exported)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function apply() {
    setError(null)
    try {
      const next = normalizeSection(JSON.parse(extractJson(pasted)))
      if (!next) throw new Error('unrecognised section: check the "kind" field')
      replaceSection(section.id, next)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-full w-full max-w-2xl flex-col gap-3 overflow-y-auto rounded-xl bg-surface p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">{section.title || 'Section'} as JSON</h2>
            <p className="mt-0.5 text-xs text-dim">
              Copy this section, or paste JSON to replace it. Ids are left out — fresh ones are
              assigned on the way back in.
            </p>
          </div>
          <Btn variant="danger" onClick={onClose} aria-label="Close">
            ✕
          </Btn>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wider text-dim">
              This section
            </span>
            <Btn variant="solid" onClick={copy}>
              {copied ? '✓ Copied' : 'Copy JSON'}
            </Btn>
          </div>
          <pre className="max-h-64 overflow-auto rounded-lg border border-line bg-raised p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-dim">
            {exported}
          </pre>
        </div>

        <div>
          <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-dim">
            Replace with
          </span>
          <TextArea
            rows={6}
            value={pasted}
            placeholder={'{\n  "kind": "timeline",\n  "title": "Experience",\n  "entries": [ ... ]\n}'}
            onChange={(e) => setPasted(e.target.value)}
            className="font-mono text-xs!"
          />
        </div>

        {error && (
          <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2">
          <span className="mr-auto text-[11px] text-faint">Undoable with Ctrl+Z.</span>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="solid" onClick={apply} disabled={!pasted.trim()}>
            Replace section
          </Btn>
        </div>
      </div>
    </div>
  )
}
