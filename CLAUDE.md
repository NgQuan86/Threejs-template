# CLAUDE.md — Quy Tắc Kỹ Thuật cho Claude Code
> Đọc `AGENTS.md` trước — phân công, module library, naming convention nằm ở đó.
> Đọc TOÀN BỘ file này trước khi viết bất kỳ dòng code nào.
> Không tuân thủ = code bị reject tại commit gate.

---

## 0. THAM CHIẾU BẮT BUỘC
Trước khi code, đọc 3 file sau theo thứ tự:

| File | Mục đích |
|------|----------|
| `vite.config.js` | Alias đang dùng, plugins, dev server config |
| `tsconfig.json` | Strict rules, path mapping, target ES version |
| `package.json` | Thư viện đã có — KHÔNG cài thêm khi chưa được phép |

---

## 1. QUY TẮC ĐƯỜNG DẪN (Tự động enforce bởi ESLint)

# ❌ CẤM TUYỆT ĐỐI
import something from '../../../utils/helper'
import { Mesh } from '../../../node_modules/three'

# ✅ BẮT BUỘC dùng Alias
import something from '@utils/helper'
import { MyShader } from '@shaders/MyShader'
import { SceneManager } from '@world/SceneManager'

Alias chuẩn của dự án:
  @/          →  src/
  @shaders/   →  src/shaders/
  @world/     →  src/world/
  @utils/     →  src/utils/
  @templates/ →  src/templates/

---

## 2. KỶ LUẬT GPU & BỘ NHỚ — Dispose First
# Đây là rule AI phải tự giác — máy không enforce được

### Checklist bắt buộc khi tạo class GPU mới:
- [ ] Có phương thức `dispose()` dọn dẹp Geometry/Material/Texture
- [ ] `dispose()` được gọi khi scene destroy hoặc component unmount
- [ ] Có guard `if (this.isDisposed) return` để tránh dispose 2 lần
- [ ] Null hóa toàn bộ reference sau khi dispose

### Pattern chuẩn:
class MyObject {
  private geometry: THREE.BufferGeometry | null = null
  private material: THREE.Material | null = null
  private isDisposed = false

  dispose(): void {
    if (this.isDisposed) return
    this.geometry?.dispose()
    this.material?.dispose()
    this.mesh?.parent?.remove(this.mesh)
    this.geometry = null
    this.material = null
    this.isDisposed = true
  }
}

---

## 3. NGÔN NGỮ SHADER

Priority order:
  1. TSL (Three.js Shading Language)  ← Ưu tiên tuyệt đối cho WebGPU
  2. WGSL                             ← Chỉ khi TSL không đủ, import ?raw
  3. GLSL                             ← Chỉ khi có file .md giải thích lý do

# ❌ CẤM inline shader string dài trong file .ts
const shader = `
  void main() { ... 200 dòng GLSL ... }   // KHÔNG
`

# ✅ ĐÚNG — tách file riêng
import oceanShader from '@shaders/ocean.wgsl?raw'

---

## 4. HONEST-UNCERTAIN — Cấm tự tin sai về API

Three.js thay đổi API liên tục. Khi không chắc chắn 100% về một API:

# ❌ CẤM
geometry.center()   // viết như thể chắc chắn, nhưng không verify

# ✅ ĐÚNG
// Không chắc geometry.center() còn tồn tại ở 0.174 — cần verify package.json + docs
geometry.center()

Quy tắc cụ thể:
- Nếu không chắc API còn tồn tại → nói rõ trước khi dùng
- Nếu không chắc signature → check node_modules/three/src/ hoặc báo user verify
- KHÔNG bịa tên method, property, uniform name

---

## 5. TYPESCRIPT DISCIPLINE (Tự động enforce bởi tsconfig + ESLint)

# ❌ CẤM
const data: any = fetchData()           // Dùng unknown thay thế
as any                                  // Không thoát lỗi bằng any
// @ts-ignore                           // Không được dùng

# ✅ ĐÚNG
const data: unknown = fetchData()
if (isValidData(data)) { ... }         // Type guard

### Async/Await — Bắt buộc có error handling:
# ❌ SAI
const result = await loadModel()

# ✅ ĐÚNG
try {
  const result = await loadModel()
} catch (error) {
  console.error('[SceneManager] Load failed:', error)
  // Fallback logic ở đây
}

### WebGPU — Bắt buộc có fallback:
const renderer = await checkWebGPUSupport()
  ? new THREE.WebGPURenderer()
  : new THREE.WebGLRenderer()   // Fallback về WebGL

---

## 5. KIỂM SOÁT KÍCH THƯỚC — Anti-Bloat

### Rule 50
Nếu một hàm vượt 50 dòng:
→ DỪNG LẠI ngay
→ Đề xuất phương án tách module
→ Chờ xác nhận trước khi viết tiếp
(ESLint sẽ cảnh báo tự động — đây là lớp nhắc nhở thứ hai)

### Template First — Bắt buộc
Mọi file mới tạo ra PHẢI:
  1. Kiểm tra src/templates/ trước
  2. Copy skeleton từ template phù hợp
  3. Chỉ thêm logic mới — không đổi cấu trúc gốc

Templates có sẵn:
  src/templates/BaseShader.ts      ← GPU resource + dispose pattern
  src/templates/BaseWorld.ts       ← Scene / Camera / Renderer
  src/templates/BaseComponent.tsx  ← React UI overlay

---

## 6. PERFORMANCE BUDGET

| Chỉ số | Giới hạn |
|--------|----------|
| Draw calls / frame | < 100 |
| Triangle count | < 500,000 |
| Texture size tối đa | 2048 × 2048 |
| Bundle size (gzipped) | < 500 KB |
| Hàm / file | < 50 dòng (Rule 50) |

### Runtime Guard — Bắt buộc trong mọi World class
Bảng số tĩnh không tự enforce được — dùng pattern này để cảnh báo runtime:

class RuntimeGuard {
  constructor(private renderer: THREE.WebGPURenderer | THREE.WebGLRenderer) {}

  check(): void {
    const { calls, triangles } = this.renderer.info.render
    if (calls > 100)       console.warn(`[Budget] Draw calls: ${calls}/100`)
    if (triangles > 500_000) console.warn(`[Budget] Triangles: ${triangles}/500k`)
  }
}

// Gọi trong animation loop:
// guard.check()   ← thêm vào cuối mỗi frame

Khi nào bắt buộc dùng:
- Mọi World class có animation loop
- Bất kỳ khi nào thêm object mới vào scene

---

## 7. COMMIT GATE — Máy tự enforce
Pipeline chặn mọi commit không đạt:

  Husky pre-commit
    └── lint-staged
          ├── tsc --noEmit        (TypeScript check)
          ├── eslint ./src        (Lint check)
          └── prettier --check    (Format check)

Lỗi bất kỳ = commit bị block hoàn toàn.
Không bypass bằng --no-verify trừ khi có lý do khẩn cấp được ghi rõ.

---

## 8. NHỮNG GÌ MÁY ĐÃ ENFORCE (AI chỉ cần biết)

| Rule | Enforce bởi | Trạng thái |
|------|-------------|------------|
| Cấm `any` | eslint (`error`) | 🛑 BẮT BUỘC |
| Cấm đường dẫn `../` | eslint import rule | 🛑 BẮT BUỘC |
| Hàm > 50 dòng (Rule 50) | eslint `max-lines-per-function` | 🛑 LỖI ĐỎ |
| Độ lồng code (Depth) > 3 | eslint `max-depth` | 🛑 LỖI ĐỎ |
| Tự động sắp xếp Import | eslint `simple-import-sort` | 🪄 TỰ ĐỘNG |
| Lỗi TS/ESLint hiện realtime | vite-plugin-checker | 📺 REALTIME |
| Commit lỗi bị block | Husky + lint-staged | 🔐 GATEKEEPER |
| Alias tự đồng bộ Vite↔TS | vite-tsconfig-paths | 🔗 ĐÃ KHỚP |
