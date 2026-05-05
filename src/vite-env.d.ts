/// <reference types="vite/client" />

// ─── Khai báo kiểu cho các biến môi trường VITE_ ─────────────────────────────
// Giúp TypeScript hiểu import.meta.env.VITE_* có kiểu gì
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENV: 'development' | 'production' | 'staging'
  readonly VITE_SHOW_STATS: string
  readonly VITE_SHOW_DEBUG: string
  readonly VITE_MAX_PIXEL_RATIO: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// ─── Khai báo kiểu cho file GLSL Shader ──────────────────────────────────────
// Cho phép: import vertexShader from './shader.vert'
declare module '*.glsl' {
  const value: string
  export default value
}

declare module '*.vert' {
  const value: string
  export default value
}

declare module '*.frag' {
  const value: string
  export default value
}
