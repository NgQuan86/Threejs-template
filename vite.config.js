/**
 * vite.config.js — Cấu hình Vite cho dự án Three.js
 *
 * VAI TRÒ:
 *   Dev server, build pipeline, alias đường dẫn, plugin hỗ trợ.
 *   Đọc file này trước khi viết bất kỳ import nào — alias @utils/@shaders/...
 *   được định nghĩa tại đây và phải khớp với tsconfig.json.
 *
 * PLUGIN:
 *   vite-plugin-restart    ← hot-reload khi file trong static/ thay đổi
 *   vite-tsconfig-paths    ← đồng bộ alias Vite ↔ TypeScript tự động
 *   vite-plugin-checker    ← hiển thị lỗi TS + ESLint realtime trong browser overlay
 */

import restart from 'vite-plugin-restart'
import checker from 'vite-plugin-checker'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

export default {
  // ─── Root & Static ──────────────────────────────────────────────────────
  // root: nơi Vite tìm index.html — mọi đường dẫn relative tính từ đây
  // publicDir: file tĩnh (texture, model, hdr...) được serve nguyên vẹn, không bundle
  root: 'src/',
  publicDir: '../static/',

  // ─── Alias đường dẫn ────────────────────────────────────────────────────
  // Phải khớp với paths trong tsconfig.json — vite-tsconfig-paths tự đồng bộ
  // Dùng alias thay đường dẫn ../../../ để tránh bị ESLint chặn
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shaders': resolve(__dirname, 'src/shaders'),
      '@world': resolve(__dirname, 'src/world'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@templates': resolve(__dirname, 'src/templates'),
    },
  },

  // ─── Dev server ─────────────────────────────────────────────────────────
  // host: true → mở trên local network (truy cập từ điện thoại cùng WiFi)
  // open: false trong môi trường sandbox (CodeSandbox/StackBlitz) để tránh lỗi
  server: {
    host: true,
    port: 3000,
    open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env),
  },

  // ─── Production build ───────────────────────────────────────────────────
  // outDir: ../dist → ra ngoài src/, ngang hàng với package.json
  // sourcemap: true → giữ lại source map để debug production build
  // manualChunks: tách three.js ra chunk riêng — browser cache lâu hơn giữa các deploy
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three'],
        },
      },
    },
  },

  // ─── Asset types bổ sung ────────────────────────────────────────────────
  // Cho phép import trực tiếp file shader — dùng kèm ?raw để lấy string
  // Ví dụ: import oceanShader from '@shaders/ocean.wgsl?raw'
  assetsInclude: ['**/*.glsl', '**/*.vert', '**/*.frag'],

  // ─── Plugins ────────────────────────────────────────────────────────────
  plugins: [
    // Hot-reload khi thêm/sửa file trong static/ (texture, model...)
    restart({ restart: ['../static/**'] }),
    // Đồng bộ alias @utils/@shaders/... giữa Vite và TypeScript compiler
    tsconfigPaths(),
    // Hiển thị lỗi TypeScript + ESLint ngay trong browser overlay lúc dev
    checker({ typescript: true, eslint: { useFlatConfig: true, lintCommand: 'eslint ./src' } }),
  ],
}
