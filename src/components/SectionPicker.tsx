import { useMemo, useState } from 'react'
import { BLANK_KINDS, PRESETS, type Preset } from '../data/presets'
import { addSection, insertSection } from '../store/resume'
import type { Section } from '../types'
import { Btn, TextInput } from './ui'

const GROUPS: Preset['group'][] = ['Core', 'Credentials', 'Extras', 'Layout']

/** Preset list used by both the between-sections strip and the bottom panel. */
export function SectionPicker({ at, onDone }: { at?: number; onDone: () => void }) {
  const [filter, setFilter] = useState('')

  const matches = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return PRESETS
    return PRESETS.filter((p) => `${p.label} ${p.hint}`.toLowerCase().includes(q))
  }, [filter])

  const blanks = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return BLANK_KINDS
    return BLANK_KINDS.filter((b) => b.label.toLowerCase().includes(q))
  }, [filter])

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-2.5 shadow-lg">
      <div className="flex items-center gap-2">
        <TextInput
          autoFocus
          value={filter}
          placeholder="Search sections…"
          onChange={(e) => setFilter(e.target.value)}
        />
        <Btn variant="subtle" onClick={onDone} aria-label="Cancel">
          ✕
        </Btn>
      </div>

      <div className="max-h-72 overflow-y-auto pr-0.5">
        {GROUPS.map((group) => {
          const inGroup = matches.filter((p) => p.group === group)
          if (inGroup.length === 0) return null
          return (
            <div key={group} className="mb-2 last:mb-0">
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-faint">{group}</p>
              <div className="grid grid-cols-2 gap-1">
                {inGroup.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      insertSection(preset.build() as Section, at)
                      onDone()
                    }}
                    className="flex flex-col items-start rounded-md border border-line bg-raised px-2 py-1.5 text-left transition hover:border-accent hover:bg-ink/5"
                  >
                    <span className="text-xs font-medium text-ink">{preset.label}</span>
                    <span className="text-[10px] text-faint">{preset.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        {blanks.length > 0 && (
          <div>
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-faint">Blank</p>
            <div className="flex flex-wrap gap-1">
              {blanks.map((b) => (
                <Btn
                  key={b.kind}
                  onClick={() => {
                    addSection(b.kind, at)
                    onDone()
                  }}
                >
                  {b.label}
                </Btn>
              ))}
            </div>
          </div>
        )}

        {matches.length === 0 && blanks.length === 0 && (
          <p className="py-6 text-center text-xs text-faint">No section matches “{filter}”.</p>
        )}
      </div>
    </div>
  )
}
