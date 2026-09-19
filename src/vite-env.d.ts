/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Optional URL for the Typst compiler wasm. Set it to keep the ~27 MiB file
   * out of the bundle (see `src/typst/engine.ts`); unset, the wasm is bundled.
   */
  readonly VITE_TYPST_COMPILER_WASM_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
