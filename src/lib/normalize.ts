import { defaultResume } from '../data/defaultResume'
import type { Resume, Section, SectionKind } from '../types'

/**
 * Tolerant parser for documents that did not come out of this app — typically
 * JSON produced by an LLM from someone's old CV. Missing fields fall back to
 * defaults, ids are (re)generated, and anything unrecognised is dropped rather
 * than crashing the compile.
 */

const uid = () => crypto.randomUUID().slice(0, 8)
const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback)
const num = (v: unknown, fallback: number) => (typeof v === 'number' && !Number.isNaN(v) ? v : fallback)
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
const obj = (v: unknown): Record<string, unknown> =>
  typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {}

const KINDS: SectionKind[] = ['bullets', 'timeline', 'projects', 'labeled']

export function normalizeResume(input: unknown): Resume {
  const root = obj(input)
  if (!Array.isArray(root.sections) && !root.header) {
    throw new Error('not a resume document: expected "header" and "sections"')
  }

  const header = obj(root.header)
  const config = obj(root.config)
  const margin = obj(config.margin)
  const d = defaultResume.config

  return {
    config: {
      margin: {
        top: num(margin.top, d.margin.top),
        right: num(margin.right, d.margin.right),
        bottom: num(margin.bottom, d.margin.bottom),
        left: num(margin.left, d.margin.left),
      },
      fontSize: num(config.fontSize, d.fontSize),
      itemSize: num(config.itemSize, d.itemSize),
      font: str(config.font, d.font),
      nameSize: num(config.nameSize, d.nameSize),
      headingSize: num(config.headingSize, d.headingSize),
      blockSpacing: num(config.blockSpacing, d.blockSpacing),
      leading: num(config.leading, d.leading),
      marker: str(config.marker, d.marker),
    },
    header: {
      name: str(header.name),
      nameUrl: str(header.nameUrl),
      email: str(header.email),
      phone: str(header.phone),
      location: str(header.location),
      profiles: arr(header.profiles).map((p) => {
        const o = obj(p)
        return { id: uid(), label: str(o.label), url: str(o.url) }
      }),
    },
    sections: arr(root.sections).map(normalizeSection).filter((s): s is Section => s !== null),
  }
}

function normalizeSection(raw: unknown): Section | null {
  const s = obj(raw)
  const kind = KINDS.includes(s.kind as SectionKind) ? (s.kind as SectionKind) : null
  if (!kind) return null

  const base = {
    id: uid(),
    title: str(s.title, 'Section'),
    enabled: s.enabled === undefined ? true : Boolean(s.enabled),
  }

  switch (kind) {
    case 'bullets':
      return {
        ...base,
        kind,
        items: arr(s.items).map((i) => ({ id: uid(), text: str(obj(i).text, textOf(i)) })),
      }
    case 'labeled':
      return {
        ...base,
        kind,
        items: arr(s.items).map((i) => {
          const o = obj(i)
          return { id: uid(), label: str(o.label), text: str(o.text), meta: str(o.meta) }
        }),
      }
    case 'projects':
      return {
        ...base,
        kind,
        items: arr(s.items).map((i) => {
          const o = obj(i)
          return {
            id: uid(),
            name: str(o.name),
            summary: str(o.summary),
            stack: str(o.stack),
            repoUrl: str(o.repoUrl),
            liveUrl: str(o.liveUrl),
          }
        }),
      }
    case 'timeline':
      return {
        ...base,
        kind,
        entries: arr(s.entries).map((e) => {
          const o = obj(e)
          return {
            id: uid(),
            org: str(o.org),
            location: str(o.location),
            role: str(o.role),
            period: str(o.period),
            bullets: arr(o.bullets).map((b) => {
              const bo = obj(b)
              return { id: uid(), label: str(bo.label), text: str(bo.text, textOf(b)) }
            }),
          }
        }),
      }
  }
}

/** Accepts a bare string where an object was expected — a common LLM slip. */
function textOf(v: unknown): string {
  return typeof v === 'string' ? v : ''
}
