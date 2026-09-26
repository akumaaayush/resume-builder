import type { ReactNode } from 'react'
import {
  addBullet,
  addItem,
  removeBullet,
  removeEntry,
  removeItem,
  removeSection,
  renameSection,
  reorderBullets,
  reorderInSection,
  setDividerVariant,
  toggleSection,
  updateBullet,
  updateEntry,
  updateItem,
} from '../store/resume'
import type { DividerVariant, Section, TimelineEntry } from '../types'
import { SortableList, SortableRow } from './Sortable'
import { Btn, Field, RowTools, TextArea, TextInput } from './ui'

const KIND_LABEL: Record<Section['kind'], string> = {
  bullets: 'bullet list',
  prose: 'prose',
  inline: 'inline list',
  timeline: 'timeline',
  projects: 'projects',
  labeled: 'labeled list',
  divider: 'divider',
}

const ADD_LABEL: Record<Section['kind'], string> = {
  bullets: '+ Bullet',
  prose: '+ Paragraph',
  inline: '+ Row',
  timeline: '+ Entry',
  projects: '+ Project',
  labeled: '+ Item',
  divider: '',
}

const DIVIDER_LABEL: Record<DividerVariant, string> = {
  page: 'Page break',
  rule: 'Horizontal rule',
  space: 'Extra space',
}

function rowIds(section: Section): string[] {
  if (section.kind === 'timeline') return section.entries.map((e) => e.id)
  if (section.kind === 'divider') return []
  return section.items.map((i) => i.id)
}

export function SectionEditor({ section, dragHandle }: { section: Section; dragHandle: ReactNode }) {
  return (
    <details open className="group rounded-lg border border-line bg-surface open:shadow-sm">
      <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg px-2 py-2.5 hover:bg-ink/5">
        <span onClick={(e) => e.preventDefault()}>{dragHandle}</span>

        <span className="text-faint transition group-open:rotate-90">›</span>

        <input
          value={section.title}
          onChange={(e) => renameSection(section.id, e.target.value)}
          onClick={(e) => e.preventDefault()}
          className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-sm font-semibold text-ink hover:border-line-strong focus:border-dim focus:outline-none"
        />

        <span className="shrink-0 rounded bg-raised px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-dim">
          {KIND_LABEL[section.kind]}
        </span>

        <label
          className="flex shrink-0 cursor-pointer items-center gap-1 text-[10px] uppercase tracking-wide text-dim"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={section.enabled}
            onChange={() => toggleSection(section.id)}
            className="accent-ink"
          />
          on
        </label>

        <div onClick={(e) => e.preventDefault()}>
          <RowTools onRemove={() => removeSection(section.id)} />
        </div>
      </summary>

      <div className="flex flex-col gap-3 border-t border-line px-3 py-3">
        {section.kind === 'divider' && (
          <div className="flex flex-wrap items-center gap-1">
            {(Object.keys(DIVIDER_LABEL) as DividerVariant[]).map((variant) => (
              <Btn
                key={variant}
                variant={section.variant === variant ? 'solid' : 'ghost'}
                onClick={() => setDividerVariant(section.id, variant)}
              >
                {DIVIDER_LABEL[variant]}
              </Btn>
            ))}
          </div>
        )}

        <SortableList
          ids={rowIds(section)}
          onReorder={(from, to) => reorderInSection(section.id, from, to)}
        >
          <div className="flex flex-col gap-3">
            {section.kind === 'prose' &&
              section.items.map((item, i) => (
                <SortableRow key={item.id} id={item.id}>
                  {(handle) => (
                    <div className="flex items-start gap-1">
                      <span className="pt-1.5">{handle}</span>
                      <TextArea
                        rows={3}
                        value={item.text}
                        placeholder="One paragraph. No bullet is added."
                        onChange={(e) => updateItem(section.id, item.id, { text: e.target.value })}
                      />
                      <RowTools
                        onInsert={() => addItem(section.id, i + 1)}
                        onRemove={() => removeItem(section.id, item.id)}
                      />
                    </div>
                  )}
                </SortableRow>
              ))}

            {section.kind === 'inline' &&
              section.items.map((item, i) => (
                <SortableRow key={item.id} id={item.id}>
                  {(handle) => (
                    <div className="flex items-start gap-1">
                      <span className="pt-1.5">{handle}</span>
                      <div className="flex min-w-0 flex-1 gap-2">
                        {/* Width lives on the wrapper: the input's own `w-full`
                            would win a class-order fight against `w-32`. */}
                        <div className="w-32 shrink-0">
                          <TextInput
                            value={item.label}
                            placeholder="Label"
                            onChange={(e) =>
                              updateItem(section.id, item.id, { label: e.target.value })
                            }
                          />
                        </div>
                        <TextInput
                          value={item.text}
                          placeholder="TypeScript, Go, SQL"
                          onChange={(e) => updateItem(section.id, item.id, { text: e.target.value })}
                        />
                      </div>
                      <RowTools
                        onInsert={() => addItem(section.id, i + 1)}
                        onRemove={() => removeItem(section.id, item.id)}
                      />
                    </div>
                  )}
                </SortableRow>
              ))}

            {section.kind === 'bullets' &&
              section.items.map((item, i) => (
                <SortableRow key={item.id} id={item.id}>
                  {(handle) => (
                    <div className="flex items-start gap-1">
                      <span className="pt-1.5">{handle}</span>
                      <TextArea
                        rows={2}
                        value={item.text}
                        onChange={(e) => updateItem(section.id, item.id, { text: e.target.value })}
                      />
                      <RowTools
                        onInsert={() => addItem(section.id, i + 1)}
                        onRemove={() => removeItem(section.id, item.id)}
                      />
                    </div>
                  )}
                </SortableRow>
              ))}

            {section.kind === 'labeled' &&
              section.items.map((item, i) => (
                <SortableRow key={item.id} id={item.id}>
                  {(handle) => (
                    <div className="flex items-start gap-1 rounded-md bg-raised p-2">
                      <span className="pt-4">{handle}</span>
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="flex gap-2">
                          <Field label="Bold label">
                            <TextInput
                              value={item.label}
                              onChange={(e) => updateItem(section.id, item.id, { label: e.target.value })}
                            />
                          </Field>
                          <Field label="Trailing (date etc.)">
                            <TextInput
                              value={item.meta}
                              onChange={(e) => updateItem(section.id, item.id, { meta: e.target.value })}
                            />
                          </Field>
                        </div>
                        <Field label="Text">
                          <TextArea
                            rows={2}
                            value={item.text}
                            onChange={(e) => updateItem(section.id, item.id, { text: e.target.value })}
                          />
                        </Field>
                      </div>
                      <RowTools
                        onInsert={() => addItem(section.id, i + 1)}
                        onRemove={() => removeItem(section.id, item.id)}
                      />
                    </div>
                  )}
                </SortableRow>
              ))}

            {section.kind === 'projects' &&
              section.items.map((item, i) => (
                <SortableRow key={item.id} id={item.id}>
                  {(handle) => (
                    <div className="flex items-start gap-1 rounded-md bg-raised p-2">
                      <span className="pt-4">{handle}</span>
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <Field label="Name">
                          <TextInput
                            value={item.name}
                            onChange={(e) => updateItem(section.id, item.id, { name: e.target.value })}
                          />
                        </Field>
                        <Field label="Summary">
                          <TextArea
                            rows={2}
                            value={item.summary}
                            onChange={(e) => updateItem(section.id, item.id, { summary: e.target.value })}
                          />
                        </Field>
                        <Field label="Stack">
                          <TextArea
                            rows={2}
                            value={item.stack}
                            onChange={(e) => updateItem(section.id, item.id, { stack: e.target.value })}
                          />
                        </Field>
                        <div className="flex gap-2">
                          <Field label="Repo URL (optional)">
                            <TextInput
                              value={item.repoUrl}
                              placeholder="https://github.com/…"
                              onChange={(e) =>
                                updateItem(section.id, item.id, { repoUrl: e.target.value })
                              }
                            />
                          </Field>
                          <Field label="Live URL (optional)">
                            <TextInput
                              value={item.liveUrl}
                              placeholder="https://…"
                              onChange={(e) =>
                                updateItem(section.id, item.id, { liveUrl: e.target.value })
                              }
                            />
                          </Field>
                        </div>
                      </div>
                      <RowTools
                        onInsert={() => addItem(section.id, i + 1)}
                        onRemove={() => removeItem(section.id, item.id)}
                      />
                    </div>
                  )}
                </SortableRow>
              ))}

            {section.kind === 'timeline' &&
              section.entries.map((entry, i) => (
                <SortableRow key={entry.id} id={entry.id}>
                  {(handle) => (
                    <EntryEditor sectionId={section.id} entry={entry} index={i} dragHandle={handle} />
                  )}
                </SortableRow>
              ))}
          </div>
        </SortableList>

        {section.kind !== 'divider' && (
          <Btn onClick={() => addItem(section.id)} className="self-start">
            {ADD_LABEL[section.kind]}
          </Btn>
        )}
      </div>
    </details>
  )
}

function EntryEditor({
  sectionId,
  entry,
  index,
  dragHandle,
}: {
  sectionId: string
  entry: TimelineEntry
  index: number
  dragHandle: ReactNode
}) {
  return (
    <div className="rounded-md border border-line bg-raised p-2">
      <div className="flex items-start gap-1">
        <span className="pt-4">{dragHandle}</span>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex gap-2">
            <Field label="Organisation">
              <TextInput
                value={entry.org}
                onChange={(e) => updateEntry(sectionId, entry.id, { org: e.target.value })}
              />
            </Field>
            <Field label="Location">
              <TextInput
                value={entry.location}
                onChange={(e) => updateEntry(sectionId, entry.id, { location: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex gap-2">
            <Field label="Role / programme">
              <TextInput
                value={entry.role}
                onChange={(e) => updateEntry(sectionId, entry.id, { role: e.target.value })}
              />
            </Field>
            <Field label="Period">
              <TextInput
                value={entry.period}
                onChange={(e) => updateEntry(sectionId, entry.id, { period: e.target.value })}
              />
            </Field>
          </div>
        </div>
        <RowTools
          onInsert={() => addItem(sectionId, index + 1)}
          onRemove={() => removeEntry(sectionId, entry.id)}
        />
      </div>

      <div className="mt-2.5 flex flex-col gap-2 border-t border-line pt-2.5">
        <SortableList
          ids={entry.bullets.map((b) => b.id)}
          onReorder={(from, to) => reorderBullets(sectionId, entry.id, from, to)}
        >
          <div className="flex flex-col gap-2">
            {entry.bullets.map((b, i) => (
              <SortableRow key={b.id} id={b.id}>
                {(handle) => (
                  <div className="flex items-start gap-1">
                    <span className="pt-1.5">{handle}</span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <TextInput
                        value={b.label}
                        placeholder="Bold lead-in (optional)"
                        onChange={(e) =>
                          updateBullet(sectionId, entry.id, b.id, { label: e.target.value })
                        }
                      />
                      <TextArea
                        rows={2}
                        value={b.text}
                        onChange={(e) => updateBullet(sectionId, entry.id, b.id, { text: e.target.value })}
                      />
                    </div>
                    <RowTools
                      onInsert={() => addBullet(sectionId, entry.id, i + 1)}
                      onRemove={() => removeBullet(sectionId, entry.id, b.id)}
                    />
                  </div>
                )}
              </SortableRow>
            ))}
          </div>
        </SortableList>

        <Btn onClick={() => addBullet(sectionId, entry.id)} className="self-start">
          + Bullet
        </Btn>
      </div>
    </div>
  )
}
