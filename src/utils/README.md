# src/utils/

Tập hợp các công cụ hỗ trợ độc lập — không phụ thuộc lẫn nhau, import thẳng vào `World.ts` khi cần.

> Thêm util mới → thêm 1 dòng vào bảng bên dưới.

---

## Danh sách

| File                       | Vai trò                                              | Dùng khi nào                                   | Bắt buộc?     |
| -------------------------- | ---------------------------------------------------- | ---------------------------------------------- | ------------- |
| `GlobalUniforms.ts`        | Singleton sync uTime/uWeather/uDamage cho mọi shader | Mọi scene dùng shader tùy chỉnh                | Khi có shader |
| `RuntimeGuard.ts`          | Cảnh báo draw calls / triangle vượt budget           | Mọi World có animation loop                    | Dev-only      |
| `ResourceLoader.ts`        | Tải và cache Texture / GLTF (Draco) / HDR            | Scene load file từ `public/`                   | Khi có asset  |
| `LoadingScreen.ts`         | Overlay progress bar khi tải asset                   | Dùng kèm `ResourceLoader`                      | Optional      |
| `ViewportLinker.ts`        | Project 3D → tọa độ pixel 2D cho HTML label          | Scene cần label/popup HTML đè lên canvas       | Optional      |
| `InteractionHelper.ts`     | Wrapper Raycaster — hover/click vào object 3D        | Scene tương tác (bấm vào nhà, hover highlight) | Optional      |
| `InstancedMeshPool.ts`     | Render nhiều object giống nhau với 1 draw call       | Scene có cây/đèn/xe lặp lại nhiều lần          | Optional      |
| `PostProcessingManager.ts` | EffectComposer: Bloom + FXAA + OutputPass            | Mọi scene cần visual quality cao               | Optional      |

---

## Mối liên hệ giữa các utils

```
BaseWorld (tự dùng)
  └── RuntimeGuard       ← check draw calls mỗi frame, dev-only

World.ts (tự kết nối)
  ├── ResourceLoader     ← tải file (GLTF thường + Draco, Texture, HDR)
  ├── LoadingScreen      ← hiển thị tiến độ tải
  │     ↑
  │     └── nhận dữ liệu qua onProgress callback từ ResourceLoader
  ├── ViewportLinker        ← project 3D → pixel, gọi trong update() mỗi frame
  ├── InteractionHelper     ← tự lắng nghe mouse event, hover/click vào mesh
  ├── InstancedMeshPool     ← 1 Pool = 1 loại object lặp lại, tự add vào scene
  └── PostProcessingManager ← override render() trong World.ts để dùng
```

`BaseWorld` tự dùng `RuntimeGuard` — không cần làm gì thêm.
`ResourceLoader` và `LoadingScreen` phải tự import vào `World.ts`.

---

## Cách dùng nhanh

### RuntimeGuard — tự động, không cần làm gì
```ts
// BaseWorld đã lo, chạy tự động khi npm run dev
// Xem cảnh báo trong browser console
```

### ResourceLoader + LoadingScreen — khi có asset thật
```ts
import { LoadingScreen } from '@utils/LoadingScreen'
import { ResourceLoader } from '@utils/ResourceLoader'

const screen = new LoadingScreen()
const loader = new ResourceLoader(screen.onProgress.bind(screen))

try {
  const texture = await loader.loadTexture('/textures/wood.jpg')
  const model   = await loader.loadGLTF('/models/scene.glb')   // thường hoặc Draco — tự nhận diện
  const env     = await loader.loadHDR('/hdr/studio.hdr')
  await screen.hide()
  this.buildScene(texture, model, env)
} catch (error) {
  console.error('[World] Load failed:', error)
}
```

> **Draco:** Copy decoder vào `static/draco/` trước khi dùng GLTF nén:
> ```
> xcopy /E /I node_modules\three\examples\jsm\libs\draco static\draco
> ```

### Dispose khi destroy scene
```ts
loader.dispose()   // giải phóng Texture + HDR + DRACOLoader khỏi GPU
// LoadingScreen tự dispose sau hide() — không cần gọi thêm
```

### ViewportLinker — label HTML đè lên canvas
```ts
import { ViewportLinker } from '@utils/ViewportLinker'

const linker = new ViewportLinker(this.camera, this.renderer.domElement.parentElement!)

// Gọi trong update() mỗi frame:
const pos = linker.toScreen(buildingMesh.position)
if (linker.isVisible(buildingMesh.position)) {
  labelDiv.style.left    = `${pos.x}px`
  labelDiv.style.top     = `${pos.y}px`
  labelDiv.style.display = 'block'
} else {
  labelDiv.style.display = 'none'
}

// Dispose:
linker.dispose()
```

### InteractionHelper — hover/click vào object 3D
```ts
import { InteractionHelper } from '@utils/InteractionHelper'

const helper = new InteractionHelper(this.camera, this.renderer.domElement)

// Hover — cursor thay đổi khi di chuột qua mesh:
helper.onHover([buildingMesh, roadMesh], (obj) => {
  document.body.style.cursor = obj ? 'pointer' : 'default'
})

// Click — callback chỉ gọi khi có hit:
helper.onClick([buildingMesh], (obj) => {
  console.log('Clicked:', obj.name)
})

// PHẢI dispose để xóa event listener, tránh DOM memory leak:
helper.dispose()
```

### InstancedMeshPool — nhiều object giống nhau với 1 draw call
```ts
import { InstancedMeshPool } from '@utils/InstancedMeshPool'

// Geometry + Material phải dành riêng cho Pool — KHÔNG dùng chung:
const treePool = new InstancedMeshPool(
  new THREE.CylinderGeometry(0.1, 0.3, 2),
  new THREE.MeshStandardMaterial({ color: 0x228B22 }),
  50,          // maxCount — cấp phát 1 lần, không resize được
  this.scene   // Pool tự add InstancedMesh vào scene
)

const i0 = treePool.addInstance(new THREE.Vector3(1, 0, 2))
const i1 = treePool.addInstance(new THREE.Vector3(5, 0, -3), new THREE.Euler(0, Math.PI / 4, 0))

// Cập nhật vị trí (dùng cho animation):
treePool.updateInstance(i0, new THREE.Vector3(1, 1, 2))

// Dispose — tự remove khỏi scene + giải phóng GPU:
treePool.dispose()
```

### PostProcessingManager — Bloom + FXAA
```ts
import { PostProcessingManager } from '@utils/PostProcessingManager'

// Trong constructor của World.ts (sau super()):
this.postProcessor = new PostProcessingManager(
  this.renderer!,
  this.scene,
  this.camera,
  { bloomStrength: 0.8, bloomThreshold: 0.7 }
)

// Override render() để thay thế renderer.render() mặc định:
protected override render(): void {
  this.postProcessor.render()
}

// Dispose:
this.postProcessor.dispose()
```

---

## Quy tắc khi thêm util mới

1. Mỗi file = 1 class, 1 vai trò rõ ràng
2. Không import lẫn nhau — util A không được import util B
3. Phải có `dispose()` nếu dùng tài nguyên GPU hoặc DOM
4. Thêm 1 dòng vào bảng danh sách phía trên
5. Viết comment đầu file theo cấu trúc: Vị trí → Vai trò → Mối liên hệ → Cách dùng


<!-- ═══════════════════════════════════════════════════════════════════════ -->
# BACKLOG — Đề xuất chưa thực hiện
> Xem lại khi dự án đủ phức tạp hoặc khi có asset thật.
<!-- ═══════════════════════════════════════════════════════════════════════ -->


### KTX2 / Basis Texture Compression
**Điều kiện:** Khi có texture thật và pipeline convert texture đã được thiết lập.
**Tại sao chưa làm:** Cần cài Basis Universal encoder tool + thêm WASM transcoder (~800KB) vào `static/`. Không có ý nghĩa khi chưa có asset.
**Khi làm:** Thêm `KTX2Loader` vào `ResourceLoader.ts` cạnh DRACOLoader. Cập nhật `loadTexture()` để nhận `.ktx2`.
```ts
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
const ktx2Loader = new KTX2Loader().setTranscoderPath('/basis/').detectSupport(renderer)
```

---

### EventBus / Pub-Sub
**Điều kiện:** Khi scene có nhiều object giao tiếp chéo nhau và `THREE.EventDispatcher` built-in không còn đủ.
**Tại sao chưa làm:** Dự án chưa có object scene nào thật. Thêm EventBus trước khi có vấn đề là over-engineering.
**Thử trước:** `THREE.EventDispatcher` — mọi `Object3D` đã kế thừa sẵn, không cần viết thêm class.
**Khi làm:** Tạo `src/utils/EventBus.ts` — typed pub/sub với generic `T extends Record<string, unknown>`.

---

### AnimationMixer Helper
**Điều kiện:** Khi load GLTF model có animation clip.
**Tại sao chưa làm:** Không có model thật, không có gì để test.
**Khi làm:** Wrapper nhỏ cho `THREE.AnimationMixer` — tự gọi `mixer.update(delta)` mỗi frame, expose `play(clipName)` / `stop()` / `crossFade()`.

---

### LOD Manager
**Điều kiện:** Khi scene có nhiều object ở xa và frame rate bắt đầu giảm.
**Tại sao chưa làm:** Chưa có object nào để đo impact.
**Khi làm:** Wrapper cho `THREE.LOD` — nhận nhiều geometry ở các mức chi tiết khác nhau, tự swap dựa trên khoảng cách camera.
