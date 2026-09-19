import type { Resume } from '../types'

/**
 * Save-to-disk via the File System Access API: the user grants access to one
 * JSON file (e.g. `resume.json` inside a git clone) and the app writes straight
 * into it. The handle is kept in IndexedDB so the link survives reloads.
 *
 * Chromium-only. Callers must check `fsSupported` first.
 */

export const fsSupported =
  typeof window !== 'undefined' && 'showSaveFilePicker' in window && 'showOpenFilePicker' in window

const DB_NAME = 'resume-builder'
const STORE = 'handles'
const HANDLE_KEY = 'resume-json'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function idb<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const req = run(db.transaction(STORE, mode).objectStore(STORE))
        req.onsuccess = () => resolve(req.result as T)
        req.onerror = () => reject(req.error)
      }),
  )
}

export function rememberHandle(handle: FileSystemFileHandle): Promise<unknown> {
  return idb('readwrite', (s) => s.put(handle, HANDLE_KEY))
}

export function forgetHandle(): Promise<unknown> {
  return idb('readwrite', (s) => s.delete(HANDLE_KEY))
}

export function recallHandle(): Promise<FileSystemFileHandle | undefined> {
  return idb<FileSystemFileHandle | undefined>('readonly', (s) => s.get(HANDLE_KEY)).catch(
    () => undefined,
  )
}

const JSON_TYPE = {
  description: 'Resume JSON',
  accept: { 'application/json': ['.json'] },
}

/** Returns true when we hold (or were just granted) write access. */
export async function ensureWritable(handle: FileSystemFileHandle): Promise<boolean> {
  const opts = { mode: 'readwrite' } as const
  if ((await handle.queryPermission(opts)) === 'granted') return true
  return (await handle.requestPermission(opts)) === 'granted'
}

export async function chooseSaveTarget(suggestedName: string): Promise<FileSystemFileHandle> {
  const handle = await window.showSaveFilePicker({ suggestedName, types: [JSON_TYPE] })
  await rememberHandle(handle)
  return handle
}

export async function chooseExistingFile(): Promise<{ handle: FileSystemFileHandle; resume: Resume }> {
  const [handle] = await window.showOpenFilePicker({ types: [JSON_TYPE], multiple: false })
  const resume = JSON.parse(await (await handle.getFile()).text()) as Resume
  await rememberHandle(handle)
  return { handle, resume }
}

export async function writeResume(handle: FileSystemFileHandle, resume: Resume): Promise<void> {
  if (!(await ensureWritable(handle))) throw new Error('write permission denied')
  const writable = await handle.createWritable()
  await writable.write(JSON.stringify(resume, null, 2))
  await writable.close()
}
