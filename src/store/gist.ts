import { Store } from '@tanstack/store'
import { createGist, parseGistId, pullGist, pushGist } from '../lib/gist'
import { normalizeResume } from '../lib/normalize'
import { replaceResume, resumeStore } from './resume'

const KEY = 'resume-builder:gist'

interface GistState {
  token: string
  gistId: string
  busy: boolean
  error: string | null
  /** Last successful push/pull, as a local timestamp. */
  syncedAt: number | null
  /** `updated_at` reported by GitHub on the last call. */
  remoteAt: string | null
  htmlUrl: string | null
}

function load(): Pick<GistState, 'token' | 'gistId'> {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as { token: string; gistId: string }
  } catch {
    // Blocked storage: the user just re-pastes the token this session.
  }
  return { token: '', gistId: '' }
}

export const gistStore = new Store<GistState>({
  ...load(),
  busy: false,
  error: null,
  syncedAt: null,
  remoteAt: null,
  htmlUrl: null,
})

function patch(next: Partial<GistState>) {
  gistStore.setState((s) => ({ ...s, ...next }))
}

function persist() {
  const { token, gistId } = gistStore.state
  try {
    localStorage.setItem(KEY, JSON.stringify({ token, gistId }))
  } catch {
    // Not fatal; credentials simply do not survive the session.
  }
}

export function setCredentials(token: string, gistId: string) {
  patch({ token: token.trim(), gistId: parseGistId(gistId), error: null })
  persist()
}

export function forgetCredentials() {
  patch({ token: '', gistId: '', syncedAt: null, remoteAt: null, htmlUrl: null, error: null })
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

export const isLinked = () => Boolean(gistStore.state.token && gistStore.state.gistId)

async function run<T>(job: () => Promise<T>): Promise<T | null> {
  patch({ busy: true, error: null })
  try {
    return await job()
  } catch (err) {
    patch({ error: err instanceof Error ? err.message : String(err) })
    return null
  } finally {
    patch({ busy: false })
  }
}

/** Create a fresh secret gist from the current document. */
export async function createRemote() {
  const { token } = gistStore.state
  if (!token) return patch({ error: 'paste a token first' })

  await run(async () => {
    const m = await createGist(token, resumeStore.state)
    patch({ gistId: m.id, remoteAt: m.updatedAt, htmlUrl: m.htmlUrl, syncedAt: Date.now() })
    persist()
  })
}

export async function push() {
  const { token, gistId } = gistStore.state
  if (!token || !gistId) return patch({ error: 'link a gist first' })

  await run(async () => {
    const m = await pushGist(token, gistId, resumeStore.state)
    patch({ remoteAt: m.updatedAt, htmlUrl: m.htmlUrl, syncedAt: Date.now() })
  })
}

export async function pull() {
  const { token, gistId } = gistStore.state
  if (!token || !gistId) return patch({ error: 'link a gist first' })

  await run(async () => {
    const { raw, meta } = await pullGist(token, gistId)
    // Same forgiving parse as any other import, so an older document still loads.
    replaceResume(normalizeResume(raw))
    patch({ remoteAt: meta.updatedAt, htmlUrl: meta.htmlUrl, syncedAt: Date.now() })
  })
}
