import type { Section, SectionKind } from '../types'

/**
 * Ready-made sections. Each one picks the right kind, a conventional title, and
 * one example row showing the shape it expects — so adding "Certifications"
 * does not mean choosing a kind and guessing the field layout.
 */

export interface Preset {
  id: string
  label: string
  group: 'Core' | 'Credentials' | 'Extras' | 'Layout'
  hint: string
  build: () => Omit<Section, 'id'> & { id?: string }
}

const uid = () => crypto.randomUUID().slice(0, 8)

const base = (title: string) => ({ id: uid(), title, enabled: true })

export const PRESETS: Preset[] = [
  {
    id: 'summary',
    label: 'Summary',
    group: 'Core',
    hint: 'Prose · opening profile paragraph',
    build: () => ({
      ...base('Professional Summary'),
      kind: 'prose',
      items: [
        {
          id: uid(),
          text: 'Engineer with N years building X, focused on Y. Most recently did Z.',
        },
      ],
    }),
  },
  {
    id: 'summary-bullets',
    label: 'Summary (bullets)',
    group: 'Core',
    hint: 'Bullets · three or four claims',
    build: () => ({
      ...base('Professional Summary'),
      kind: 'bullets',
      items: [
        { id: uid(), text: '' },
        { id: uid(), text: '' },
        { id: uid(), text: '' },
      ],
    }),
  },
  {
    id: 'experience',
    label: 'Experience',
    group: 'Core',
    hint: 'Timeline · role, dates, bullets',
    build: () => ({
      ...base('Experience'),
      kind: 'timeline',
      entries: [
        {
          id: uid(),
          org: '',
          location: '',
          role: '',
          period: '',
          bullets: [{ id: uid(), label: '', text: '' }],
        },
      ],
    }),
  },
  {
    id: 'education',
    label: 'Education',
    group: 'Core',
    hint: 'Timeline · school, degree, years',
    build: () => ({
      ...base('Education'),
      kind: 'timeline',
      entries: [{ id: uid(), org: '', location: '', role: '', period: '', bullets: [] }],
    }),
  },
  {
    id: 'skills',
    label: 'Skills',
    group: 'Core',
    hint: 'Inline · compact label + values',
    build: () => ({
      ...base('Technical Skills'),
      kind: 'inline',
      items: [
        { id: uid(), label: 'Languages', text: '' },
        { id: uid(), label: 'Backend', text: '' },
        { id: uid(), label: 'Frontend', text: '' },
        { id: uid(), label: 'Infrastructure', text: '' },
      ],
    }),
  },
  {
    id: 'projects',
    label: 'Projects',
    group: 'Core',
    hint: 'Projects · name, summary, links',
    build: () => ({
      ...base('Projects'),
      kind: 'projects',
      items: [{ id: uid(), name: '', summary: '', stack: '', repoUrl: '', liveUrl: '' }],
    }),
  },

  {
    id: 'certifications',
    label: 'Certifications',
    group: 'Credentials',
    hint: 'Labeled · name, issuer, year',
    build: () => ({
      ...base('Certifications'),
      kind: 'labeled',
      items: [{ id: uid(), label: '', text: '- issuing body', meta: '' }],
    }),
  },
  {
    id: 'awards',
    label: 'Awards',
    group: 'Credentials',
    hint: 'Labeled · award, context, year',
    build: () => ({
      ...base('Awards'),
      kind: 'labeled',
      items: [{ id: uid(), label: '', text: '- awarded by', meta: '' }],
    }),
  },
  {
    id: 'publications',
    label: 'Publications',
    group: 'Credentials',
    hint: 'Labeled · title, venue, year',
    build: () => ({
      ...base('Publications'),
      kind: 'labeled',
      items: [{ id: uid(), label: '', text: '- venue', meta: '' }],
    }),
  },
  {
    id: 'open-source',
    label: 'Open Source',
    group: 'Credentials',
    hint: 'Projects · repo links included',
    build: () => ({
      ...base('Open Source'),
      kind: 'projects',
      items: [{ id: uid(), name: '', summary: '', stack: '', repoUrl: '', liveUrl: '' }],
    }),
  },

  {
    id: 'volunteering',
    label: 'Volunteering',
    group: 'Extras',
    hint: 'Timeline · organisation and dates',
    build: () => ({
      ...base('Volunteering'),
      kind: 'timeline',
      entries: [
        {
          id: uid(),
          org: '',
          location: '',
          role: '',
          period: '',
          bullets: [{ id: uid(), label: '', text: '' }],
        },
      ],
    }),
  },
  {
    id: 'speaking',
    label: 'Speaking',
    group: 'Extras',
    hint: 'Labeled · talk, event, year',
    build: () => ({
      ...base('Talks & Speaking'),
      kind: 'labeled',
      items: [{ id: uid(), label: '', text: '- event', meta: '' }],
    }),
  },
  {
    id: 'languages',
    label: 'Languages',
    group: 'Extras',
    hint: 'Inline · language and level',
    build: () => ({
      ...base('Languages'),
      kind: 'inline',
      items: [
        { id: uid(), label: 'English', text: 'Native' },
        { id: uid(), label: '', text: '' },
      ],
    }),
  },
  {
    id: 'interests',
    label: 'Interests',
    group: 'Extras',
    hint: 'Prose · one short line',
    build: () => ({
      ...base('Interests'),
      kind: 'prose',
      items: [{ id: uid(), text: '' }],
    }),
  },
  {
    id: 'references',
    label: 'References',
    group: 'Extras',
    hint: 'Prose · available on request',
    build: () => ({
      ...base('References'),
      kind: 'prose',
      items: [{ id: uid(), text: 'Available on request.' }],
    }),
  },

  {
    id: 'page-break',
    label: 'Page break',
    group: 'Layout',
    hint: 'Start the next section on a new page',
    build: () => ({ ...base('Page break'), kind: 'divider', variant: 'page' }),
  },
  {
    id: 'rule',
    label: 'Rule',
    group: 'Layout',
    hint: 'Thin horizontal line',
    build: () => ({ ...base('Rule'), kind: 'divider', variant: 'rule' }),
  },
  {
    id: 'spacer',
    label: 'Spacer',
    group: 'Layout',
    hint: 'Extra vertical gap',
    build: () => ({ ...base('Spacer'), kind: 'divider', variant: 'space' }),
  },
]

/** Blank sections, for when none of the presets fit. */
export const BLANK_KINDS: { kind: SectionKind; label: string }[] = [
  { kind: 'bullets', label: 'Bullet list' },
  { kind: 'prose', label: 'Prose' },
  { kind: 'inline', label: 'Inline list' },
  { kind: 'timeline', label: 'Timeline' },
  { kind: 'projects', label: 'Projects' },
  { kind: 'labeled', label: 'Labeled list' },
]
