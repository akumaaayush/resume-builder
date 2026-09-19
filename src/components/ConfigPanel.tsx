import { updateConfig, updateMargin } from '../store/resume'
import type { DocConfig } from '../types'
import { Field, TextInput } from './ui'

const FONTS = ['New Computer Modern', 'NewCMMono10']

function Num({
  label,
  value,
  step = 0.5,
  onChange,
}: {
  label: string
  value: number
  step?: number
  onChange: (n: number) => void
}) {
  return (
    <Field label={label}>
      <TextInput
        type="number"
        step={step}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value)
          if (!Number.isNaN(n)) onChange(n)
        }}
      />
    </Field>
  )
}

export function ConfigPanel({ config }: { config: DocConfig }) {
  return (
    <section className="rounded-lg border border-line bg-surface p-3">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink">Layout</h2>

      <div className="flex flex-col gap-2.5">
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-dim">
            Margins (inches)
          </p>
          <div className="flex gap-2">
            <Num label="Top" step={0.025} value={config.margin.top} onChange={(n) => updateMargin('top', n)} />
            <Num
              label="Right"
              step={0.025}
              value={config.margin.right}
              onChange={(n) => updateMargin('right', n)}
            />
            <Num
              label="Bottom"
              step={0.025}
              value={config.margin.bottom}
              onChange={(n) => updateMargin('bottom', n)}
            />
            <Num
              label="Left"
              step={0.025}
              value={config.margin.left}
              onChange={(n) => updateMargin('left', n)}
            />
          </div>
        </div>

        <Field label="Font family">
          <TextInput
            list="typst-fonts"
            value={config.font}
            onChange={(e) => updateConfig({ font: e.target.value })}
          />
        </Field>
        <datalist id="typst-fonts">
          {FONTS.map((f) => (
            <option key={f} value={f} />
          ))}
        </datalist>

        <div className="flex gap-2">
          <Num label="Body pt" value={config.fontSize} onChange={(n) => updateConfig({ fontSize: n })} />
          <Num label="Item pt" value={config.itemSize} onChange={(n) => updateConfig({ itemSize: n })} />
          <Num label="Name pt" value={config.nameSize} onChange={(n) => updateConfig({ nameSize: n })} />
          <Num
            label="Heading pt"
            value={config.headingSize}
            onChange={(n) => updateConfig({ headingSize: n })}
          />
        </div>

        <div className="flex gap-2">
          <Num
            label="Section gap pt"
            value={config.blockSpacing}
            onChange={(n) => updateConfig({ blockSpacing: n })}
          />
          <Num label="Leading em" step={0.05} value={config.leading} onChange={(n) => updateConfig({ leading: n })} />
          <Field label="Bullet">
            <TextInput
              value={config.marker}
              maxLength={2}
              onChange={(e) => updateConfig({ marker: e.target.value })}
            />
          </Field>
        </div>
      </div>
    </section>
  )
}
