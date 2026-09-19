/**
 * The File System Access API is only partially typed in lib.dom, so the pieces
 * we use are declared here.
 */

interface FsPermissionDescriptor {
  mode?: 'read' | 'readwrite'
}

interface FsPickerAcceptType {
  description?: string
  accept: Record<string, string | string[]>
}

interface FsSavePickerOptions {
  suggestedName?: string
  types?: FsPickerAcceptType[]
}

interface FsOpenPickerOptions {
  multiple?: boolean
  types?: FsPickerAcceptType[]
}

interface FileSystemFileHandle {
  queryPermission(descriptor?: FsPermissionDescriptor): Promise<PermissionState>
  requestPermission(descriptor?: FsPermissionDescriptor): Promise<PermissionState>
}

interface Window {
  showSaveFilePicker(options?: FsSavePickerOptions): Promise<FileSystemFileHandle>
  showOpenFilePicker(options?: FsOpenPickerOptions): Promise<FileSystemFileHandle[]>
}
