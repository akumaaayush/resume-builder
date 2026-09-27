import type { Resume } from '../types'

/**
 * Sync through a secret GitHub Gist. No backend, and every save becomes a gist
 * revision, so the edit history is free.
 *
 * The token needs the fine-grained "Gists: read and write" account permission
 * (or the classic `gist` scope) and nothing else — it cannot touch repositories.
 */

const API = 'https://api.github.com'
const FILENAME = 'resume.json'

export interface GistMeta {
  id: string
  updatedAt: string
  htmlUrl: string
}

/**
 * Accepts a bare id or any gist URL — the web page, the `.git` clone URL, or a
 * raw file link — so pasting whatever GitHub shows you just works.
 */
export function parseGistId(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''
  if (!trimmed.includes('/')) return trimmed

  const path = trimmed.split(/[?#]/)[0].replace(/\/+$/, '')
  const segments = path.split('/').filter(Boolean)
  // Gist ids are long hex strings; prefer one if the URL contains it.
  const hex = segments.find((seg) => /^[0-9a-f]{20,}$/i.test(seg.replace(/\.git$/, '')))
  const chosen = hex ?? segments.at(-1) ?? trimmed
  return chosen.replace(/\.git$/, '')
}

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  }
}

async function failure(res: Response): Promise<Error> {
  const detail = await res
    .json()
    .then((b: { message?: string }) => b.message)
    .catch(() => undefined)

  if (res.status === 401) return new Error('token rejected — check it has the Gists permission')
  if (res.status === 404) return new Error('gist not found, or the token cannot see it')
  if (res.status === 403) return new Error(detail ?? 'forbidden — rate limited or missing scope')
  return new Error(detail ?? `GitHub returned ${res.status}`)
}

function meta(body: { id: string; updated_at: string; html_url: string }): GistMeta {
  return { id: body.id, updatedAt: body.updated_at, htmlUrl: body.html_url }
}

export async function createGist(token: string, resume: Resume): Promise<GistMeta> {
  const res = await fetch(`${API}/gists`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({
      description: 'resume-builder document',
      // "Secret", not private: unlisted, but anyone with the URL can read it.
      public: false,
      files: { [FILENAME]: { content: JSON.stringify(resume, null, 2) } },
    }),
  })
  if (!res.ok) throw await failure(res)
  return meta(await res.json())
}

export async function pushGist(token: string, id: string, resume: Resume): Promise<GistMeta> {
  const res = await fetch(`${API}/gists/${id}`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify({
      files: { [FILENAME]: { content: JSON.stringify(resume, null, 2) } },
    }),
  })
  if (!res.ok) throw await failure(res)
  return meta(await res.json())
}

export async function pullGist(
  token: string,
  id: string,
): Promise<{ raw: unknown; meta: GistMeta }> {
  const res = await fetch(`${API}/gists/${id}`, { headers: headers(token) })
  if (!res.ok) throw await failure(res)

  const body = await res.json()
  const file = body.files?.[FILENAME]
  if (!file) throw new Error(`gist has no ${FILENAME}`)

  // Gists over 1MB come back truncated with a raw_url to fetch instead. This
  // document is ~15KB, but handle it rather than silently importing nothing.
  const content = file.truncated ? await fetch(file.raw_url).then((r) => r.text()) : file.content

  return { raw: JSON.parse(content), meta: meta(body) }
}
