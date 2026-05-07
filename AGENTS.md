# AGENTS.md — Quy Tắc Chung Cho Mọi AI Agent
> Đọc file này TRƯỚC KHI làm việc trong dự án này.
> Áp dụng cho: Claude Code, Antigravity (Gemini), và mọi AI agent khác.

---

## A. Project Overview

| | |
|---|---|
| Tech stack | Three.js 0.174, Vite 6, TypeScript 5 (strict) |
| Renderer | WebGL (hiện tại) → WebGPU (roadmap) |
| AI agents | Claude Code (shader/GPU/code) + Antigravity Gemini (architecture/git) |

Chi tiết quy tắc kỹ thuật:
- Claude Code → đọc `CLAUDE.md`
- Antigravity → đọc `GEMINI.md`

---

## B. Module Library

Path local: `C:/DEV WEB/modules/threejs-modules/`
GitHub: `https://github.com/NgQuan86/threejs-modules` (private)

### Quy tắc sử dụng
- Đọc thẳng từ path local — **KHÔNG** `git clone`, **KHÔNG** gọi GitHub API
- **KHÔNG** sửa bất kỳ file nào trong thư mục modules

### Quy trình tìm module
1. Đọc `C:/DEV WEB/modules/threejs-modules/README.md` → xem catalog
2. Tìm module theo tên/tags trong bảng
3. Đọc `[category]/[tên]/meta.json` → props, deps, complexity
4. Đọc `[category]/[tên]/index.ts` → lấy code
5. Copy vào đúng thư mục project — giữ nguyên dispose pattern

---

## C. Handoff Protocol (Gemini ↔ Claude Code)

```
src/imported/              ← Gemini drop module vào đây
    [module-name]/
        index.ts           ← code gốc, KHÔNG sửa
        SUMMARY.md         ← Gemini viết, Claude Code đọc
.module-lock.json          ← project root, Claude Code cập nhật sau mỗi adapt
```

**Luồng:**
1. Gemini tìm module → copy vào `src/imported/` → viết `SUMMARY.md`
2. Gemini thông báo: `"Đã import [tên], Claude Code đọc src/imported/[tên]/SUMMARY.md"`
3. Claude Code đọc `SUMMARY.md` → adapt vào scene chính
4. Claude Code cập nhật `.module-lock.json` → quyết định lifecycle `src/imported/[tên]/`:

| Trường hợp | Hành động |
|---|---|
| Module đơn giản (≤ 50 dòng, 1 file) | Xóa folder — lock file đủ để trace |
| Module phức tạp hoặc cần diff sau này | Giữ lại → thêm vào `.gitignore` |

Mặc định: xóa. Giữ lại khi module có logic phức tạp hoặc bạn dự định re-adapt.

**Format `.module-lock.json`:**
```json
{
  "modules": [
    {
      "name": "WaterShader",
      "category": "shaders",
      "commit-sha": "abc123def",
      "imported-at": "2026-05-04",
      "status": "adapted",
      "integrated-into": "src/world/Ocean.ts"
    }
  ]
}
```

`commit-sha` = SHA của commit trong `threejs-modules` repo tại thời điểm import — Gemini lấy bằng `git log -1 --format=%H` trước khi copy.

---

## D. Phân Quyền Agent

| Tác vụ | Gemini | Claude Code |
|--------|:------:|:-----------:|
| Search + pull module từ library | ✅ | ❌ |
| git pull / push / commit | ✅ | ❌ |
| Cập nhật README catalog | ✅ | ❌ |
| Viết SUMMARY.md handoff | ✅ | ❌ |
| Kiểm kho khi Three.js update | ✅ | ❌ |
| Scan grep tìm API bị ảnh hưởng | ✅ | ❌ |
| Viết + xóa MAINTENANCE.md | ✅ | ❌ |
| Lên kế hoạch kiến trúc tổng thể | ✅ | ❌ |
| Adapt module vào scene chính | ❌ | ✅ |
| Sửa code theo MAINTENANCE.md | ❌ | ✅ |
| Viết shader / GPU logic | ❌ | ✅ |
| Debug TypeScript, fix lint | ❌ | ✅ |
| Tối ưu memory / performance | ❌ | ✅ |

---

## E. Naming Convention

| Loại | Format | Ví dụ |
|------|--------|-------|
| Class / Component | PascalCase | `OceanSurface.ts` |
| Utility / Helper | camelCase | `mathUtils.ts` |
| Constant | UPPER_SNAKE | `MAX_PARTICLE_COUNT` |
| Shader file | PascalCase | `OceanSurface.wgsl` |
| React component | PascalCase | `DebugPanel.tsx` |
| Hook | camelCase + `use` | `useAnimationLoop.ts` |

---

## F. Thư Viện — Không Tự Ý Cài Thêm

1. Kiểm tra `package.json` — thư viện có thể đã tồn tại
2. Nếu chưa có → **đề xuất** tên + lý do cụ thể
3. Chờ xác nhận từ user
4. Sau khi được phép → `npm install`

**CẤM** tự `npm install` không xin phép.

---

## G. Quy tắc Phối hợp & An toàn

1. **Hỏi trước khi sửa code**: Đối với Antigravity (Gemini), trước khi thực hiện bất kỳ thay đổi nào vào mã nguồn chính (trừ thư mục `src/imported/`), **BẮT BUỘC** phải báo cáo kế hoạch và hỏi ý kiến user.
2. **Tránh xung đột**: Quy tắc này giúp đảm bảo Antigravity không ghi đè lên những gì Claude Code đang thực hiện trong cùng một tệp.
3. **Phê duyệt**: Chỉ khi user phản hồi "OK" hoặc "Tiến hành đi", Antigravity mới được phép ghi đè file.
