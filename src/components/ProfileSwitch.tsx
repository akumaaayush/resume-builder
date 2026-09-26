import { useEffect, useState } from 'react'
import { loadLocalProfiles, type LocalProfile } from '../lib/profiles'
import { defaultResume } from '../data/defaultResume'
import { replaceResume } from '../store/resume'

const STARTER = '__starter__'

/**
 * Dev-only shortcut for swapping between the starter document and personal
 * copies in `examples/`. Renders nothing in production.
 */
export function ProfileSwitch() {
  const [profiles, setProfiles] = useState<LocalProfile[]>([])
  const [current, setCurrent] = useState(STARTER)

  useEffect(() => {
    void loadLocalProfiles().then(setProfiles)
  }, [])

  if (!import.meta.env.DEV || profiles.length === 0) return null

  return (
    <select
      value={current}
      data-tip="Load a local document (dev only)"
      aria-label="Load a local document"
      onChange={(e) => {
        const value = e.target.value
        setCurrent(value)
        const picked = profiles.find((p) => p.file === value)
        replaceResume(picked ? picked.doc : defaultResume)
      }}
      className="rounded-md border border-line bg-raised px-2 py-1.5 text-xs text-dim outline-none transition hover:border-line-strong hover:text-ink"
    >
      <option value={STARTER}>Starter</option>
      {profiles.map((p) => (
        <option key={p.file} value={p.file}>
          {p.label}
        </option>
      ))}
    </select>
  )
}
