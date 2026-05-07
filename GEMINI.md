# GEMINI.md — Antigravity Workspace Rules
> Đọc `AGENTS.md` trước — phân công, module library, handoff protocol nằm ở đó.
> File này chỉ chứa workflow chi tiết và cấu hình Antigravity-specific.

---

## Role: Git Librarian — PULL module về project

Khi user yêu cầu feature/module mới:

```
1. Đọc C:/DEV WEB/modules/threejs-modules/README.md → xem catalog
2. Tìm module phù hợp theo tags và mô tả
3. Đọc meta.json của module → kiểm tra performance-cost và three-version-compatible
4. Đọc index.ts để xem code thực tế
5. Lấy commit SHA hiện tại: cd "C:/DEV WEB/modules/threejs-modules" && git log -1 --format=%H
6. Copy toàn bộ folder vào src/imported/[tên-module]/
7. Viết src/imported/[tên-module]/SUMMARY.md (xem format bên dưới) — thêm commit-sha vào
8. KHÔNG sửa logic — import nguyên bản
9. Thông báo: "Đã import [tên], Claude Code đọc src/imported/[tên]/SUMMARY.md"
```

### Format SUMMARY.md (bắt buộc, < 20 dòng)

```markdown
## [ModuleName]
Source: [category]/[folder-name]
Category: shader | util | component | hook

Props:
- propName (type, default=value): mô tả ngắn

Usage:
import { ModuleName } from '@shaders/ModuleName'
// ví dụ ngắn

Cần trong scene: [geometry, light, v.v.]
Không cần sửa: [list những thứ đã ổn]
Cần adapt: [list những thứ Claude Code cần chỉnh]
```

---

## Role: Git Librarian — PUSH module mới lên GitHub

Khi Claude Code báo "module đã sẵn sàng để lưu vào library":

```
1. cd "C:/DEV WEB/modules/threejs-modules"
2. git pull origin main
3. git checkout -b feat/add-[tên-module-kebab-case]
4. Tạo folder mới: [category]/[ModuleName]/
5. Copy file từ project vào (index.ts, README.md)
6. Điền meta.json đầy đủ theo template _template/meta.json
7. Cập nhật bảng catalog trong README.md root (thêm 1 dòng)
8. git add .
9. git commit -m "feat: add [category]/[ModuleName]"
10. git push origin feat/add-[tên-module-kebab-case]
11. Thông báo: "Branch feat/add-[tên] sẵn sàng — merge khi bạn review xong"
```

---

## Role: Library Inspector — Bảo trì kho modules

**Kích hoạt khi:** Three.js ra phiên bản mới, hoặc user yêu cầu "kiểm kho".

**Nhiệm vụ:** Là người duy nhất chủ động kiểm tra sức khoẻ của kho modules.
Claude Code không làm việc này — chỉ được gọi khi có file MAINTENANCE.md.

```
1. Đọc changelog Three.js phiên bản mới
   → https://github.com/mrdoob/three.js/releases

2. Xác định breaking changes (API rename/remove/thay đổi signature)

3. Tag trạng thái hiện tại trước khi làm bất cứ điều gì:
   git tag three@[version-cũ]-stable
   git push origin three@[version-cũ]-stable

4. Tạo branch migration:
   git checkout -b chore/migrate-three@[version-mới]

5. Grep toàn bộ C:/DEV WEB/modules/threejs-modules/
   → Tìm mọi file dùng API bị ảnh hưởng

6. Phân loại kết quả:
   - Không bị ảnh hưởng → cập nhật "threejs" field trong meta.json
   - Bị ảnh hưởng → ghi vào MAINTENANCE.md

7. Tạo file C:/DEV WEB/modules/threejs-modules/MAINTENANCE.md:
```

### Format MAINTENANCE.md

```markdown
## Three.js [version] — [ngày kiểm tra]

### Modules cần Claude Code sửa
- `shaders/WaterShader/index.ts:12`
  Lý do: `WebGLRenderer.setSize()` đổi signature → `setSize(w, h, updateStyle?)`
  API cũ: `renderer.setSize(w, h)`
  API mới: `renderer.setSize(w, h, false)`

- `utils/mathUtils/index.ts:8`
  Lý do: `MathUtils.clamp` bị remove → dùng `THREE.clamp` thay thế

### Modules đã cập nhật meta.json (không cần sửa code)
- shaders/GlowShader → threejs: "0.175+"
- hooks/useAnimationLoop → threejs: "0.175+"
```

```
8. Thông báo: "Kiểm kho xong. [N] modules cần sửa — xem MAINTENANCE.md"

9. Sau khi Claude Code sửa xong và báo lại:
   → Xóa MAINTENANCE.md
   → git add .
   → git commit -m "chore: migrate to three@[version]"
   → git push origin chore/migrate-three@[version]
   → Thông báo: "Branch chore/migrate-three@[version] sẵn sàng — merge khi bạn review xong"
```

---

## Branch & Tag Convention

| Tình huống | Branch | Tag trước khi làm |
|---|---|---|
| Thêm module mới | `feat/add-[tên-kebab]` | Không cần |
| Migrate Three.js version | `chore/migrate-three@[version]` | `three@[version-cũ]-stable` |
| Fix lỗi nhỏ (< 5 dòng, 1 file) | trực tiếp `main` | Không cần |

**Tên branch — kebab-case, ví dụ:**
- `feat/add-water-shader`
- `feat/add-use-scroll-3d`
- `chore/migrate-three@0.175`

**Không bao giờ** push thẳng lên `main` khi migration hoặc thêm module mới.
Luôn thông báo cho user để review trước khi merge.

---

## Quy tắc Antigravity-specific

- Dùng **Gemini Flash** cho tác vụ search + git (tiết kiệm quota)
- Dùng **Gemini Pro** khi: phân tích breaking changes, đọc changelog Three.js, viết MAINTENANCE.md — những task đòi hỏi đối chiếu API cũ/mới chính xác
- Browser subagent: verify visual sau khi Claude Code integrate xong
- **KHÔNG** tự ý chỉnh code trong `src/` (trừ `src/imported/`).
- **BẮT BUỘC** hỏi ý kiến user trước khi thực hiện bất kỳ thay đổi nào vào mã nguồn chính để tránh xung đột với Claude Code.
