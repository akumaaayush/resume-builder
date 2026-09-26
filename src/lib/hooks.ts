import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { compileDocument } from '../typst/engine'
import type { Resume } from '../types'

export function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

/**
 * Compiles the document to SVG plus its page-fit numbers. The query key is the
 * document itself, so react-query dedupes identical states and keeps the last
 * good render on screen while a new one compiles.
 */
export function useCompiledDoc(resume: Resume) {
  return useQuery({
    queryKey: ['typst-doc', resume],
    queryFn: () => compileDocument(resume),
    staleTime: Infinity,
    gcTime: 60_000,
    retry: false,
    placeholderData: (prev) => prev,
  })
}
