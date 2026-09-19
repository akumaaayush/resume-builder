import raw from './defaultResume.json'
import { normalizeResume } from '../lib/normalize'
import type { Resume } from '../types'

/**
 * Starter document shown on first run and restored by "Reset".
 *
 * The content lives in `defaultResume.json` so it can be edited as plain data —
 * no TypeScript, no ids to invent. Running it through the importer fills in
 * anything the JSON omits and assigns the ids the editor needs.
 */
export const defaultResume: Resume = normalizeResume(raw)
