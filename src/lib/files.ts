import { compilePdf } from '../typst/engine'
import { normalizeResume } from './normalize'
import type { Resume } from '../types'

function slug(name: string): string {
  return name.trim().replace(/\s+/g, '_') || 'resume'
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadPdf(resume: Resume) {
  const bytes = await compilePdf(resume)
  saveBlob(new Blob([bytes as BlobPart], { type: 'application/pdf' }), `${slug(resume.header.name)}.pdf`)
}

export function downloadJson(resume: Resume) {
  const blob = new Blob([JSON.stringify(resume, null, 2)], { type: 'application/json' })
  saveBlob(blob, `${slug(resume.header.name)}.json`)
}

export function pickJson(): Promise<Resume> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return reject(new Error('no file chosen'))
      try {
        resolve(normalizeResume(JSON.parse(await file.text())))
      } catch (err) {
        reject(err instanceof Error ? err : new Error('invalid JSON'))
      }
    }
    input.click()
  })
}
