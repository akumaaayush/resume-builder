/**
 * App mark: a sheet carrying the section heading + rule that the resume
 * template is built around. Inlined rather than loaded from /favicon.svg so it
 * renders with the first paint; keep the two in sync if the artwork changes.
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="7.5" fill="#0b0b0e" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="7" fill="none" stroke="#2f2f3b" />
      <rect x="8.5" y="5.5" width="15" height="21" rx="2" fill="#ffffff" />
      <rect x="11" y="9.2" width="6.5" height="2.4" rx="1.2" fill="#4f46e5" />
      <rect x="11" y="13" width="10" height="1.4" rx="0.7" fill="#818cf8" />
      <rect x="11" y="16.6" width="10" height="1.8" rx="0.9" fill="#d4d4dc" />
      <rect x="11" y="20" width="7" height="1.8" rx="0.9" fill="#d4d4dc" />
    </svg>
  )
}
