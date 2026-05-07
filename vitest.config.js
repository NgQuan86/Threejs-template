/**
 * vitest.config.js — Cấu hình Vitest cho dự án Three.js
 *
 * VAI TRÒ:
 *   Định nghĩa môi trường test, nơi tìm file test, và coverage report.
 *   Vitest dùng jsdom để giả lập DOM — không có WebGL context thật.
 *
 * GIỚI HẠN:
 *   Các class cần WebGL (InstancedMeshPool, PostProcessingManager...) không
 *   test được trong môi trường này — cần mock THREE hoặc test bằng browser thật.
 *   Nên ưu tiên test các util thuần logic: toán học, state tracking, event handling.
 *
 * CÁCH CHẠY:
 *   npm run test        ← watch mode (tự chạy lại khi lưu file)
 *   npm run test:run    ← chạy 1 lần rồi thoát (dùng cho CI)
 *   npm run test:ui     ← mở giao diện web xem kết quả trực quan
 */

import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    // ─── Môi trường ───────────────────────────────────────────────────────
    // jsdom giả lập browser DOM — đủ cho test logic, event listener, math util
    // Không có WebGL → THREE.WebGLRenderer sẽ throw nếu khởi tạo thật
    environment: 'jsdom',

    // globals: true → dùng describe/it/expect mà không cần import từ vitest
    globals: true,

    // ─── Tìm file test ────────────────────────────────────────────────────
    // Convention: đặt file test cạnh file nguồn (MyUtil.test.ts)
    // hoặc tập trung trong thư mục tests/ ở root
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],

    // ─── Coverage report ──────────────────────────────────────────────────
    // Chỉ đo coverage cho utils và math — bỏ qua main.ts và type declarations
    // Chạy: npm run test:run -- --coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/utils/**', 'src/math/**'],
      exclude: ['src/main.ts', 'src/**/*.d.ts'],
    },

    // ─── Setup files ──────────────────────────────────────────────────────
    // Bỏ comment dòng dưới khi cần global mock (THREE renderer, canvas context...)
    // setupFiles: ['./tests/setup.ts'],

    // ─── Timeout ──────────────────────────────────────────────────────────
    // 10s cho các phép tính 3D nặng hoặc async loader test
    testTimeout: 10000,
  },

  // ─── Alias — phải khớp với vite.config.js ─────────────────────────────────
  // Vitest chạy độc lập với Vite nên cần khai báo lại alias ở đây
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@shaders': resolve(__dirname, 'src/shaders'),
      '@templates': resolve(__dirname, 'src/templates'),
      '@world': resolve(__dirname, 'src/world'),
    },
  },
})
