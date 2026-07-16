/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** GAS Web App のデプロイURL（例: https://script.google.com/macros/s/xxxx/exec） */
  readonly VITE_GAS_ENDPOINT_URL: string
  /** GAS側のスクリプトプロパティ SHARED_SECRET と同じ値 */
  readonly VITE_GAS_SHARED_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
