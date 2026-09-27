/** Strips code fences and stray prose that models (and humans) wrap JSON in. */
export function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const body = (fenced ? fenced[1] : raw).trim()
  const start = body.search(/[[{]/)
  const end = Math.max(body.lastIndexOf('}'), body.lastIndexOf(']'))
  if (start === -1 || end === -1) throw new Error('no JSON found in the pasted text')
  return body.slice(start, end + 1)
}

/**
 * Deep copy without `id` fields. Ids are internal bookkeeping, so exported
 * JSON stays portable — the importer mints fresh ones on the way back in.
 */
export function stripIds<T>(value: T): T {
  if (Array.isArray(value)) return value.map(stripIds) as T
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (key === 'id') continue
      out[key] = stripIds(val)
    }
    return out as T
  }
  return value
}
