import { useState } from 'react'
import { useStore } from '@tanstack/react-store'
import {
  createRemote,
  forgetCredentials,
  gistStore,
  pull,
  push,
  setCredentials,
} from '../store/gist'
import { Btn, Field, TextInput } from './ui'

export function GistDialog({ onClose }: { onClose: () => void }) {
  const state = useStore(gistStore)
  const [token, setToken] = useState(state.token)
  const [gistId, setGistId] = useState(state.gistId)
  const linked = Boolean(token.trim() && gistId.trim())

  // Actions read credentials from the store, so commit whatever is typed before
  // firing one -- otherwise pasting a token and hitting Create does nothing.
  function commit() {
    setCredentials(token, gistId)
  }

  // "Create new gist" mints an id in the store; copy it back into the field so
  // push/pull light up without reopening the dialog.
  async function create() {
    commit()
    await createRemote()
    setGistId(gistStore.state.gistId)
  }

  function act(fn: () => Promise<unknown> | void) {
    return () => {
      commit()
      void fn()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-full w-full max-w-lg flex-col gap-3 overflow-y-auto rounded-xl bg-surface p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Sync through a GitHub Gist</h2>
            <p className="mt-0.5 text-xs text-dim">
              Push the document to a secret gist and pull it on another machine. Every push is a
              gist revision, so you get history for free.
            </p>
          </div>
          <Btn variant="danger" onClick={onClose} aria-label="Close">
            ✕
          </Btn>
        </div>

        <Field label="Personal access token">
          <TextInput
            type="password"
            value={token}
            placeholder="github_pat_… or ghp_…"
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setToken(e.target.value)}
            onBlur={commit}
          />
        </Field>
        <p className="-mt-1 text-[11px] text-faint">
          Needs only the <span className="text-dim">Gists: read and write</span> permission. It is
          kept in this browser&rsquo;s localStorage and sent to api.github.com, nowhere else.
        </p>

        <Field label="Gist id">
          <TextInput
            value={gistId}
            placeholder="gist id or URL — or press Create"
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setGistId(e.target.value)}
            onBlur={commit}
          />
        </Field>

        <div className="flex flex-wrap items-center gap-2">
          <Btn disabled={state.busy || !token.trim()} onClick={create}>
            Create new gist
          </Btn>
          {linked && (
            <Btn
              variant="danger"
              onClick={() => {
                forgetCredentials()
                setToken('')
                setGistId('')
              }}
            >
              Forget
            </Btn>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <Btn variant="solid" disabled={state.busy || !linked} onClick={act(push)}>
            {state.busy ? 'Working…' : '↑ Push to gist'}
          </Btn>
          <Btn disabled={state.busy || !linked} onClick={act(pull)}>
            ↓ Pull from gist
          </Btn>
          {state.htmlUrl && (
            <a
              href={state.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-dim underline-offset-2 hover:text-ink hover:underline"
            >
              open on GitHub
            </a>
          )}
        </div>

        {state.remoteAt && (
          <p className="text-[11px] text-faint">
            Gist last changed {new Date(state.remoteAt).toLocaleString()}
            {state.syncedAt ? ` · synced ${new Date(state.syncedAt).toLocaleTimeString()}` : ''}
          </p>
        )}

        {state.error && (
          <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
            {state.error}
          </p>
        )}

        <p className="text-[11px] text-faint">
          Pulling replaces the current document (undoable with Ctrl+Z). A secret gist is unlisted,
          not private — treat its URL as the secret.
        </p>
      </div>
    </div>
  )
}
