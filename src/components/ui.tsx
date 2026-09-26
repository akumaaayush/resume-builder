import type { ReactNode } from 'react'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wider text-dim">{label}</span>
      {children}
    </label>
  )
}

// Caller classes are appended, but class-attribute order does not settle
// Tailwind conflicts -- whichever utility sits later in the generated
// stylesheet wins. To override a utility below (width, text size), put it on a
// wrapper element or use the `!` important suffix.
const inputClass =
  'w-full rounded-md border border-line bg-raised px-2 py-1.5 text-sm text-ink outline-none transition placeholder:text-faint hover:border-line-strong focus:border-accent focus:ring-2 focus:ring-accent/25'

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} resize-y leading-snug ${props.className ?? ''}`} />
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'ghost' | 'subtle' | 'danger'
}

export function Btn({ variant = 'ghost', className = '', ...rest }: BtnProps) {
  const styles = {
    solid:
      'bg-accent text-white shadow-sm shadow-accent/30 hover:bg-accent-hi disabled:bg-line disabled:text-faint disabled:shadow-none',
    ghost:
      'border border-line bg-raised text-dim hover:border-line-strong hover:text-ink disabled:text-faint disabled:hover:border-line',
    subtle: 'border border-transparent text-faint hover:bg-ink/10 hover:text-ink',
    danger: 'border border-transparent text-faint hover:bg-danger/15 hover:text-danger',
  }[variant]
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed ${styles} ${className}`}
    />
  )
}

/** Insert-below / delete cluster shared by every repeatable row. Reordering is
 *  handled by the drag handle supplied by SortableRow. */
export function RowTools({ onInsert, onRemove }: { onInsert?: () => void; onRemove: () => void }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {onInsert && (
        <Btn variant="subtle" onClick={onInsert} data-tip="Insert below" aria-label="Insert below">
          ＋
        </Btn>
      )}
      <Btn variant="danger" onClick={onRemove} data-tip="Remove" aria-label="Remove">
        ✕
      </Btn>
    </div>
  )
}
