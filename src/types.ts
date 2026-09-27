/** Data model for the resume document. Serialised straight to JSON and read by
 *  the Typst template via `json("resume.json")`, so field names are part of the
 *  template contract -- rename here means rename in template.typ too. */

export interface Link {
  id: string
  label: string
  url: string
}

export interface Bullet {
  id: string
  /** Bold lead-in, e.g. "API Development". Optional. */
  label: string
  text: string
  /** Nested detail lines, rendered with the LaTeX level-two marker. */
  children: SimpleItem[]
}

/** Education / experience entry: two lines, each with a right-aligned column. */
export interface TimelineEntry {
  id: string
  org: string
  location: string
  role: string
  period: string
  bullets: Bullet[]
}

export interface ProjectItem {
  id: string
  name: string
  summary: string
  stack: string
  /** Optional. Renders a GitHub mark next to the name when set. */
  repoUrl: string
  /** Optional. Renders a globe next to the name when set. */
  liveUrl: string
}

/** Accomplishment-style row: bold label, then trailing text. */
export interface LabeledItem {
  id: string
  label: string
  text: string
  meta: string
}

export interface SimpleItem {
  id: string
  text: string
}

/** Compact `Label   value · value` row. */
export interface InlineItem {
  id: string
  label: string
  text: string
}

export type DividerVariant = 'page' | 'rule' | 'space'

interface SectionBase {
  id: string
  title: string
  enabled: boolean
}

export type Section =
  | (SectionBase & { kind: 'bullets'; items: SimpleItem[] })
  | (SectionBase & { kind: 'prose'; items: SimpleItem[] })
  | (SectionBase & { kind: 'inline'; items: InlineItem[] })
  | (SectionBase & { kind: 'timeline'; entries: TimelineEntry[] })
  | (SectionBase & { kind: 'projects'; items: ProjectItem[] })
  | (SectionBase & { kind: 'labeled'; items: LabeledItem[] })
  | (SectionBase & { kind: 'divider'; variant: DividerVariant })

export type SectionKind = Section['kind']

export interface Header {
  name: string
  nameUrl: string
  email: string
  phone: string
  location: string
  profiles: Link[]
}

export interface DocConfig {
  /** Page margins in inches. */
  margin: { top: number; right: number; bottom: number; left: number }
  /** Body font size in pt. */
  fontSize: number
  /** List item font size in pt (LaTeX \small). */
  itemSize: number
  /** Typst font family name. */
  font: string
  /** Name font size in pt (LaTeX \Large). */
  nameSize: number
  /** Section heading size in pt (LaTeX \large). */
  headingSize: number
  /** Extra vertical space between blocks, in pt. */
  blockSpacing: number
  /** Paragraph leading multiplier. */
  leading: number
  /** Bullet marker glyph. */
  marker: string
  /** Put bullet body text on its own line, under the bold lead-in. */
  stackBulletLabels: boolean
}

export interface Resume {
  config: DocConfig
  header: Header
  sections: Section[]
}
