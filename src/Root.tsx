import { useCallback, useEffect, useState } from 'react'
import App from './App'
import { Landing } from './components/Landing'

/**
 * Two routes, so no router dependency: `/` is the landing page and `/edit` is
 * the editor. The Cloudflare config serves index.html for unknown paths, so
 * deep links and refreshes land here either way.
 */
export function Root() {
  const [path, setPath] = useState(() => window.location.pathname)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to: string) => {
    window.history.pushState({}, '', to)
    setPath(to)
  }, [])

  const editing = path.replace(/\/+$/, '').endsWith('/edit')

  return editing ? (
    <App onHome={() => navigate(import.meta.env.BASE_URL)} />
  ) : (
    <Landing onOpen={() => navigate(`${import.meta.env.BASE_URL}edit`)} />
  )
}
