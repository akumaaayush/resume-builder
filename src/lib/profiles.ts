import { normalizeResume } from './normalize'
import type { Resume } from '../types'

export interface LocalProfile {
  file: string
  label: string
  doc: Resume
}

/**
 * Documents found in `examples/` during `pnpm dev`, served by the
 * `local-profiles` dev middleware (see vite.config.ts). Returns nothing in a
 * production build, where the endpoint does not exist and the files were never
 * bundled.
 */
export async function loadLocalProfiles(): Promise<LocalProfile[]> {
  if (!import.meta.env.DEV) return []
  try {
    const res = await fetch('/__profiles')
    if (!res.ok) return []
    const raw = (await res.json()) as { file: string; label: string; doc: unknown }[]
    return raw.map((p) => ({ file: p.file, label: p.label, doc: normalizeResume(p.doc) }))
  } catch {
    return []
  }
}
