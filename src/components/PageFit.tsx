import type { PageFit as Fit } from '../typst/engine'

const PT_PER_IN = 72

function inches(pt: number) {
  return `${(pt / PT_PER_IN).toFixed(1)}in`
}

/**
 * Resume editing is mostly a fight against page count, so the toolbar says
 * where the document stands: how much room is left, or how much has to come
 * out to drop a page.
 */
export function PageFit({ fit, stale }: { fit: Fit | null | undefined; stale: boolean }) {
  if (!fit) return null

  const pages = fit.pages
  const free = Math.max(0, fit.usablePt - fit.usedOnLastPt)
  const overflowing = pages > 1

  // A page break leaves the last page nearly empty; don't call that "trim".
  const label = overflowing
    ? `trim ${inches(fit.usedOnLastPt)} to fit ${pages - 1}`
    : `${inches(free)} free`

  const tone = overflowing
    ? fit.usedOnLastPt < fit.usablePt * 0.25
      ? 'text-amber-400'
      : 'text-dim'
    : 'text-emerald-400'

  return (
    <span
      className={`flex items-center gap-1.5 rounded-md bg-raised px-2 py-1 text-xs text-dim tabular-nums ${
        stale ? 'opacity-50' : ''
      }`}
      data-tip={
        overflowing
          ? `Page ${pages} holds ${inches(fit.usedOnLastPt)} of content`
          : 'Room left on the page'
      }
    >
      {pages} {pages === 1 ? 'page' : 'pages'}
      <span className="text-faint">·</span>
      <span className={tone}>{label}</span>
    </span>
  )
}
