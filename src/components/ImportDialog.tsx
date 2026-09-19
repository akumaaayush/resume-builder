import { useState } from 'react'
import { IMPORT_PROMPT } from '../lib/importPrompt'
import { normalizeResume } from '../lib/normalize'
import { replaceResume } from '../store/resume'
import { Btn, TextArea } from './ui'

/** Strips code fences / stray prose that models like to wrap JSON in. */
function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const body = (fenced ? fenced[1] : raw).trim()
  const start = body.indexOf('{')
  const end = body.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('no JSON object found in the pasted text')
  return body.slice(start, end + 1)
}

export function ImportDialog({ onClose }: { onClose: () => void }) {
  const [pasted, setPasted] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function copyPrompt() {
    await navigator.clipboard.writeText(IMPORT_PROMPT)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function doImport() {
    setError(null)
    try {
      replaceResume(normalizeResume(JSON.parse(extractJson(pasted))))
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
        className="flex max-h-full w-full max-w-3xl flex-col gap-3 overflow-y-auto rounded-xl bg-surface p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Start from an existing CV</h2>
            <p className="mt-0.5 text-xs text-dim">
              Copy this prompt into ChatGPT / Claude, attach your current résumé, then paste the JSON it
              returns back here.
            </p>
          </div>
          <Btn variant="danger" onClick={onClose} aria-label="Close">
            ✕
          </Btn>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wider text-dim">
              Step 1 — the prompt
            </span>
            <Btn variant="solid" onClick={copyPrompt}>
              {copied ? '✓ Copied' : 'Copy prompt'}
            </Btn>
          </div>
          <pre className="max-h-56 overflow-auto rounded-lg border border-line bg-raised p-3 text-[11px] leading-relaxed whitespace-pre-wrap text-dim">
            {IMPORT_PROMPT}
          </pre>
        </div>

        <div>
          <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-dim">
            Step 2 — paste the JSON it gave you
          </span>
          <TextArea
            rows={8}
            value={pasted}
            placeholder={'{\n  "header": { ... },\n  "sections": [ ... ]\n}'}
            onChange={(e) => setPasted(e.target.value)}
            className="font-mono text-xs"
          />
        </div>

        {error && (
          <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2">
          <span className="mr-auto text-[11px] text-faint">
            Replaces the current document — undoable with Ctrl+Z.
          </span>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="solid" onClick={doImport} disabled={!pasted.trim()}>
            Import
          </Btn>
        </div>
      </div>
    </div>
  )
}
