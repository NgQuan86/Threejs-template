/** @type {import('prettier').Config} */
export default {
  // ─── Độ rộng & Thụt lề ────────────────────────────────────────────────
  printWidth: 100,          // Số ký tự tối đa mỗi dòng
  tabWidth: 2,              // 2 spaces
  useTabs: false,           // Dùng spaces, không phải tabs

  // ─── Dấu câu & Chuỗi ──────────────────────────────────────────────────
  semi: false,              // Không dùng dấu chấm phẩy cuối dòng
  singleQuote: true,        // Dùng dấu nháy đơn
  quoteProps: 'as-needed',  // Chỉ dùng quotes cho key khi cần thiết
  trailingComma: 'es5',     // Dấu phẩy cuối (ES5 safe: objects, arrays)

  // ─── Khoảng trắng ─────────────────────────────────────────────────────
  bracketSpacing: true,     // { foo: bar } thay vì {foo: bar}
  arrowParens: 'always',    // (x) => x thay vì x => x

  // ─── Xuống dòng ───────────────────────────────────────────────────────
  endOfLine: 'lf',          // Unix line endings (nhất quán trên mọi OS)

  // ─── Overrides cho từng loại file ─────────────────────────────────────
  overrides: [
    {
      files: ['*.glsl', '*.vert', '**/*.frag', '*.wgsl'],
      options: {
        printWidth: 120,    // Shader: đủ rộng cho matrix 4x4 và vector math
      },
    },
    {
      files: ['*.json'],
      options: {
        trailingComma: 'none',
      },
    },
  ],
}
