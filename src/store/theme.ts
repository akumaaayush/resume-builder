import { Store } from '@tanstack/store'

export type Theme = 'dark' | 'light'

const KEY = 'resume-builder:theme'

function initial(): Theme {
  const saved = localStorage.getItem(KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export const themeStore = new Store<Theme>(initial())

/** Dark is the stylesheet default, so only light needs a class on <html>. */
function apply(theme: Theme) {
  document.documentElement.classList.toggle('light', theme === 'light')
}

apply(themeStore.state)

export function toggleTheme() {
  const next: Theme = themeStore.state === 'dark' ? 'light' : 'dark'
  themeStore.setState(() => next)
  localStorage.setItem(KEY, next)
  apply(next)
}
