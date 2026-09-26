export function Preview({
  svg,
  error,
  isFetching,
  isPending,
  zoom,
}: {
  svg: string | undefined
  error: Error | null
  isFetching: boolean
  isPending: boolean
  zoom: number
}) {
  return (
    <div className="relative h-full overflow-auto bg-canvas p-6">
      {isFetching && (
        <div className="pointer-events-none sticky top-0 z-10 flex justify-center">
          <span className="rounded-full border border-line bg-surface/95 px-3 py-1 text-[11px] font-medium text-ink shadow-lg">
            compiling…
          </span>
        </div>
      )}

      {error && (
        <pre className="mb-4 max-w-full overflow-auto whitespace-pre-wrap rounded-lg border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
          {error.message}
        </pre>
      )}

      {isPending && !svg && <p className="py-20 text-center text-sm text-dim">Loading Typst compiler…</p>}

      {svg && (
        <div
          className="paper mx-auto w-fit origin-top drop-shadow-[0_6px_28px_rgba(0,0,0,0.45)] transition-transform [&_svg]:block [&_svg]:h-auto [&_svg]:max-w-none"
          style={{ transform: `scale(${zoom})` }}
          // Output of the Typst renderer; regenerated on every compile.
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </div>
  )
}
