import { Store } from '@tanstack/store'
import {
  chooseExistingFile,
  chooseSaveTarget,
  ensureWritable,
  forgetHandle,
  recallHandle,
  writeResume,
} from '../lib/fileSystem'
import { replaceResume, resumeStore } from './resume'
import type { Resume } from '../types'

interface FileState {
  name: string | null
  dirty: boolean
  savedAt: number | null
  error: string | null
}

export const fileStore = new Store<FileState>({
  name: null,
  dirty: false,
  savedAt: null,
  error: null,
})

/** Handles are not serialisable into the store, so they live alongside it. */
let handle: FileSystemFileHandle | null = null

function patch(next: Partial<FileState>) {
  fileStore.setState((s) => ({ ...s, ...next }))
}

// Any edit after a save marks the linked file stale.
resumeStore.subscribe(() => {
  if (handle) patch({ dirty: true })
})

/** Re-attach to the file picked in a previous session, if the handle survived. */
export async function restoreLink() {
  const saved = await recallHandle()
  if (saved) {
    handle = saved
    patch({ name: saved.name, dirty: false })
  }
}

export async function linkNewFile(suggestedName: string) {
  try {
    handle = await chooseSaveTarget(suggestedName)
    patch({ name: handle.name, error: null })
    await save()
  } catch (err) {
    reportUnlessCancelled(err)
  }
}

export async function openFile() {
  try {
    const picked = await chooseExistingFile()
    handle = picked.handle
    replaceResume(picked.resume)
    patch({ name: picked.handle.name, dirty: false, savedAt: Date.now(), error: null })
  } catch (err) {
    reportUnlessCancelled(err)
  }
}

export async function unlink() {
  handle = null
  await forgetHandle()
  patch({ name: null, dirty: false, savedAt: null })
}

export async function save(resume: Resume = resumeStore.state) {
  if (!handle) return
  try {
    if (!(await ensureWritable(handle))) {
      patch({ error: 'permission denied' })
      return
    }
    await writeResume(handle, resume)
    patch({ dirty: false, savedAt: Date.now(), error: null })
  } catch (err) {
    patch({ error: err instanceof Error ? err.message : String(err) })
  }
}

export const hasLinkedFile = () => handle !== null

function reportUnlessCancelled(err: unknown) {
  // The picker throws AbortError when the user closes the dialog.
  if (err instanceof DOMException && err.name === 'AbortError') return
  patch({ error: err instanceof Error ? err.message : String(err) })
}
