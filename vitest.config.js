import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    // ─── Môi trường test ─────────────────────────────────────────────────
    environment: 'jsdom',       // Giả lập DOM cho WebGL context
    globals: true,              // Dùng describe/it/expect không cần import

    // ─── Tìm kiếm file test ───────────────────────────────────────────────
    include: [
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
      'tests/**/*.test.ts',
    ],
    exclude: ['node_modules', 'dist'],

    // ─── Coverage report ─────────────────────────────────────────────────
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/utils/**', 'src/math/**'],
      exclude: ['src/main.ts', 'src/**/*.d.ts'],
    },

    // ─── Setup files ─────────────────────────────────────────────────────
    // setupFiles: ['./tests/setup.ts'],

    // ─── Timeout (ms) cho các phép tính 3D nặng ──────────────────────────
    testTimeout: 10000,
  },

  // ─── Alias giống Vite để test import @/ hoạt động ────────────────────────
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@shaders': resolve(__dirname, 'src/shaders'),
      '@components': resolve(__dirname, 'src/components'),
    },
  },
})
