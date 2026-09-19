import { addProfile, removeProfile, updateHeader, updateProfile } from '../store/resume'
import type { Header } from '../types'
import { Btn, Field, TextInput } from './ui'

export function HeaderEditor({ header }: { header: Header }) {
  return (
    <section className="rounded-lg border border-line bg-surface p-3">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink">Header</h2>

      <div className="flex flex-col gap-2.5">
        <div className="flex gap-2">
          <Field label="Name">
            <TextInput value={header.name} onChange={(e) => updateHeader({ name: e.target.value })} />
          </Field>
          <Field label="Name links to">
            <TextInput
              value={header.nameUrl}
              placeholder="https://..."
              onChange={(e) => updateHeader({ nameUrl: e.target.value })}
            />
          </Field>
        </div>

        <div className="flex gap-2">
          <Field label="Email">
            <TextInput value={header.email} onChange={(e) => updateHeader({ email: e.target.value })} />
          </Field>
          <Field label="Phone">
            <TextInput value={header.phone} onChange={(e) => updateHeader({ phone: e.target.value })} />
          </Field>
        </div>

        <Field label="Location">
          <TextInput value={header.location} onChange={(e) => updateHeader({ location: e.target.value })} />
        </Field>

        <div className="mt-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wider text-dim">
              Profile links
            </span>
            <Btn onClick={() => addProfile()}>+ Link</Btn>
          </div>
          {header.profiles.map((p) => (
            <div key={p.id} className="flex items-end gap-2">
              <Field label="Label">
                <TextInput
                  value={p.label}
                  placeholder="Github"
                  onChange={(e) => updateProfile(p.id, { label: e.target.value })}
                />
              </Field>
              <Field label="URL">
                <TextInput
                  value={p.url}
                  placeholder="https://..."
                  onChange={(e) => updateProfile(p.id, { url: e.target.value })}
                />
              </Field>
              <Btn variant="danger" onClick={() => removeProfile(p.id)} aria-label="Remove link">
                ✕
              </Btn>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
