import { Store } from '@tanstack/store'
import { defaultResume } from '../data/defaultResume'
import type {
  Bullet,
  DividerVariant,
  DocConfig,
  Header,
  LabeledItem,
  ProjectItem,
  Resume,
  Section,
  SectionKind,
  SimpleItem,
  TimelineEntry,
} from '../types'

const STORAGE_KEY = 'resume-builder:doc:v1'
const HISTORY_LIMIT = 100

const uid = () => crypto.randomUUID().slice(0, 8)

function load(): Resume {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultResume
    const parsed = JSON.parse(raw) as Resume
    // Config gains fields over time; fall back to defaults for anything missing.
    return { ...parsed, config: { ...defaultResume.config, ...parsed.config } }
  } catch {
    return defaultResume
  }
}

export const resumeStore = new Store<Resume>(load())

const past: Resume[] = []
const future: Resume[] = []
export const historyStore = new Store({ canUndo: false, canRedo: false })

function syncHistoryFlags() {
  historyStore.setState(() => ({ canUndo: past.length > 0, canRedo: future.length > 0 }))
}

function persist(doc: Resume) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doc))
  } catch {
    // Quota or private mode: preview still works, just no autosave.
  }
}

/** Every mutation funnels through here so undo/redo and autosave stay honest. */
function commit(update: (doc: Resume) => Resume) {
  const prev = resumeStore.state
  const next = update(prev)
  if (next === prev) return
  past.push(prev)
  if (past.length > HISTORY_LIMIT) past.shift()
  future.length = 0
  resumeStore.setState(() => next)
  persist(next)
  syncHistoryFlags()
}

export function undo() {
  const prev = past.pop()
  if (!prev) return
  future.push(resumeStore.state)
  resumeStore.setState(() => prev)
  persist(prev)
  syncHistoryFlags()
}

export function redo() {
  const next = future.pop()
  if (!next) return
  past.push(resumeStore.state)
  resumeStore.setState(() => next)
  persist(next)
  syncHistoryFlags()
}

/** Replace the whole document (JSON import, reset). Undoable. */
export function replaceResume(doc: Resume) {
  commit(() => ({ ...doc, config: { ...defaultResume.config, ...doc.config } }))
}

export function resetResume() {
  commit(() => defaultResume)
}

export function updateHeader(patch: Partial<Header>) {
  commit((doc) => ({ ...doc, header: { ...doc.header, ...patch } }))
}

export function updateConfig(patch: Partial<DocConfig>) {
  commit((doc) => ({ ...doc, config: { ...doc.config, ...patch } }))
}

export function updateMargin(side: keyof DocConfig['margin'], value: number) {
  commit((doc) => ({
    ...doc,
    config: { ...doc.config, margin: { ...doc.config.margin, [side]: value } },
  }))
}

/** Insert at `at`, or append when `at` is out of range / omitted. */
function insert<T>(list: T[], item: T, at?: number): T[] {
  if (at == null || at < 0 || at >= list.length) return [...list, item]
  return [...list.slice(0, at), item, ...list.slice(at)]
}

export function addProfile(at?: number) {
  commit((doc) => ({
    ...doc,
    header: {
      ...doc.header,
      profiles: insert(doc.header.profiles, { id: uid(), label: '', url: '' }, at),
    },
  }))
}

export function updateProfile(id: string, patch: Partial<{ label: string; url: string }>) {
  commit((doc) => ({
    ...doc,
    header: {
      ...doc.header,
      profiles: doc.header.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    },
  }))
}

export function removeProfile(id: string) {
  commit((doc) => ({
    ...doc,
    header: { ...doc.header, profiles: doc.header.profiles.filter((p) => p.id !== id) },
  }))
}

// --- sections -------------------------------------------------------------

function mapSection(doc: Resume, id: string, fn: (s: Section) => Section): Resume {
  return { ...doc, sections: doc.sections.map((s) => (s.id === id ? fn(s) : s)) }
}

function arrayMove<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export function emptySection(kind: SectionKind): Section {
  const base = { id: uid(), title: 'New Section', enabled: true }
  switch (kind) {
    case 'bullets':
    case 'prose':
      return { ...base, kind, items: [{ id: uid(), text: '' }] }
    case 'inline':
      return { ...base, kind, items: [{ id: uid(), label: '', text: '' }] }
    case 'divider':
      return { ...base, kind, variant: 'space' }
    case 'timeline':
      return { ...base, kind, entries: [newEntry()] }
    case 'projects':
      return { ...base, kind, items: [{ id: uid(), name: '', summary: '', stack: '', repoUrl: '', liveUrl: '' }] }
    case 'labeled':
      return { ...base, kind, items: [{ id: uid(), label: '', text: '', meta: '' }] }
  }
}

function newEntry(): TimelineEntry {
  return { id: uid(), org: '', location: '', role: '', period: '', bullets: [] }
}

export function addSection(kind: SectionKind, at?: number) {
  commit((doc) => ({ ...doc, sections: insert(doc.sections, emptySection(kind), at) }))
}

/** Insert a ready-made section (see `data/presets.ts`). */
export function insertSection(section: Section, at?: number) {
  commit((doc) => ({ ...doc, sections: insert(doc.sections, section, at) }))
}

export function removeSection(id: string) {
  commit((doc) => ({ ...doc, sections: doc.sections.filter((s) => s.id !== id) }))
}

export function reorderSections(from: number, to: number) {
  commit((doc) => ({ ...doc, sections: arrayMove(doc.sections, from, to) }))
}

export function renameSection(id: string, title: string) {
  commit((doc) => mapSection(doc, id, (s) => ({ ...s, title })))
}

export function toggleSection(id: string) {
  commit((doc) => mapSection(doc, id, (s) => ({ ...s, enabled: !s.enabled })))
}

// --- section items --------------------------------------------------------

type ItemOf<K extends SectionKind> = K extends 'bullets'
  ? SimpleItem
  : K extends 'projects'
    ? ProjectItem
    : LabeledItem

function withItems(s: Section, fn: (items: any[]) => any[]): Section {
  if (s.kind === 'timeline' || s.kind === 'divider') return s
  return { ...s, items: fn(s.items) } as Section
}

export function addItem(sectionId: string, at?: number) {
  commit((doc) =>
    mapSection(doc, sectionId, (s) => {
      if (s.kind === 'timeline') return { ...s, entries: insert(s.entries, newEntry(), at) }
      if (s.kind === 'projects')
        return { ...s, items: insert(s.items, { id: uid(), name: '', summary: '', stack: '', repoUrl: '', liveUrl: '' }, at) }
      if (s.kind === 'labeled')
        return { ...s, items: insert(s.items, { id: uid(), label: '', text: '', meta: '' }, at) }
      if (s.kind === 'inline')
        return { ...s, items: insert(s.items, { id: uid(), label: '', text: '' }, at) }
      if (s.kind === 'divider') return s
      return { ...s, items: insert(s.items, { id: uid(), text: '' }, at) }
    }),
  )
}

export function updateItem<K extends SectionKind>(
  sectionId: string,
  itemId: string,
  patch: Partial<ItemOf<K>>,
) {
  commit((doc) =>
    mapSection(doc, sectionId, (s) =>
      withItems(s, (items) => items.map((it) => (it.id === itemId ? { ...it, ...patch } : it))),
    ),
  )
}

export function removeItem(sectionId: string, itemId: string) {
  commit((doc) =>
    mapSection(doc, sectionId, (s) => withItems(s, (items) => items.filter((it) => it.id !== itemId))),
  )
}

export function setDividerVariant(id: string, variant: DividerVariant) {
  commit((doc) => mapSection(doc, id, (s) => (s.kind === 'divider' ? { ...s, variant } : s)))
}

/** Works for both item-based and timeline sections. */
export function reorderInSection(sectionId: string, from: number, to: number) {
  commit((doc) =>
    mapSection(doc, sectionId, (s) =>
      s.kind === 'timeline'
        ? { ...s, entries: arrayMove(s.entries, from, to) }
        : withItems(s, (items) => arrayMove(items, from, to)),
    ),
  )
}

// --- timeline entries & their bullets ------------------------------------

function mapEntries(s: Section, fn: (entries: TimelineEntry[]) => TimelineEntry[]): Section {
  if (s.kind !== 'timeline') return s
  return { ...s, entries: fn(s.entries) }
}

export function updateEntry(sectionId: string, entryId: string, patch: Partial<TimelineEntry>) {
  commit((doc) =>
    mapSection(doc, sectionId, (s) =>
      mapEntries(s, (entries) => entries.map((e) => (e.id === entryId ? { ...e, ...patch } : e))),
    ),
  )
}

export function removeEntry(sectionId: string, entryId: string) {
  commit((doc) =>
    mapSection(doc, sectionId, (s) => mapEntries(s, (entries) => entries.filter((e) => e.id !== entryId))),
  )
}


function mapBullets(
  s: Section,
  entryId: string,
  fn: (bullets: Bullet[]) => Bullet[],
): Section {
  return mapEntries(s, (entries) =>
    entries.map((e) => (e.id === entryId ? { ...e, bullets: fn(e.bullets) } : e)),
  )
}

export function addBullet(sectionId: string, entryId: string, at?: number) {
  commit((doc) =>
    mapSection(doc, sectionId, (s) =>
      mapBullets(s, entryId, (bullets) => insert(bullets, { id: uid(), label: '', text: '' }, at)),
    ),
  )
}

export function updateBullet(
  sectionId: string,
  entryId: string,
  bulletId: string,
  patch: Partial<Bullet>,
) {
  commit((doc) =>
    mapSection(doc, sectionId, (s) =>
      mapBullets(s, entryId, (bullets) =>
        bullets.map((b) => (b.id === bulletId ? { ...b, ...patch } : b)),
      ),
    ),
  )
}

export function removeBullet(sectionId: string, entryId: string, bulletId: string) {
  commit((doc) =>
    mapSection(doc, sectionId, (s) =>
      mapBullets(s, entryId, (bullets) => bullets.filter((b) => b.id !== bulletId)),
    ),
  )
}

export function reorderBullets(sectionId: string, entryId: string, from: number, to: number) {
  commit((doc) =>
    mapSection(doc, sectionId, (s) => mapBullets(s, entryId, (bullets) => arrayMove(bullets, from, to))),
  )
}
