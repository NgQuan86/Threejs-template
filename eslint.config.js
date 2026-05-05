import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // ─── 1. Bỏ qua các thư mục không cần kiểm tra ─────────────────────────────
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js'],
  },

  // ─── 2. Cấu hình cơ bản ───────────────────────────────────────────────────
  js.configs.recommended,

  // ─── 3. SIÊU KỶ LUẬT (Strict Mode cho TS) ────────────────────────────────
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'prettier': prettierPlugin,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // ─── A. ÉP KỶ LUẬT IMPORT (Luôn đồng nhất) ─────────────────────────────
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // ─── B. LUẬT "PHÁO ĐÀI" (Biến Warn thành Error) ────────────────────────
      ...tsPlugin.configs['recommended'].rules,
      '@typescript-eslint/no-explicit-any': 'error',           // CẤM tuyệt đối 'any'
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-non-null-assertion': 'error',    // CẤM '!' trừ khi thực sự cần

      // ─── C. LUẬT "KHU PHỐ" (Rule 50 - Anti Bloat) ──────────────────────────
      'max-lines-per-function': ['error', { 
        max: 50, 
        skipBlankLines: true, 
        skipComments: true 
      }],
      'max-depth': ['error', 3],                               // Không lồng code quá 3 tầng
      'complexity': ['error', 10],                             // Không viết logic quá rắc rối

      // ─── D. THREE.JS & GPU DISCIPLINE ──────────────────────────────────────
      'no-unused-expressions': 'error',

      // ─── E. PRETTIER INTEGRATION ──────────────────────────────────────────
      'prettier/prettier': 'error',
    },
  },

  // ─── 4. Tắt các rules xung đột với Prettier ───────────────────────────────
  prettierConfig,
]
