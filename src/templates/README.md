# src/templates/

Bộ khung base cho mọi project Three.js. **Không sửa trực tiếp các file này** — extend hoặc copy ra rồi chỉnh.

---

## Tổng quan 3 template

| File | Dùng cho | Extend hay Copy |
|---|---|---|
| `BaseWorld.ts` | Scene chính — engine 3D | **Extend** |
| `BaseShader.ts` | Shader / material tùy chỉnh | **Extend** |
| `BaseComponent.ts` | Object 3D trong scene | **Extend** |

---

## BaseWorld.ts

**Vai trò:** Quản lý toàn bộ vòng đời của scene 3D — khởi tạo, animation loop, cleanup.

### Những gì BaseWorld tự lo

```
Khởi tạo:   Scene → Camera → Renderer → DevTools (chỉ dev)
Loop:        Stats.begin → OrbitControls.update → update() → render() → RuntimeGuard.check → Stats.end
Resize:      Tự cập nhật aspect ratio và renderer size
Dispose:     Dọn Stats, OrbitControls, RuntimeGuard, Renderer
```

### Dev tools tự động (chỉ chạy khi npm run dev)

| Tool | Hiển thị |
|---|---|
| `Stats.js` | FPS counter góc trái màn hình |
| `OrbitControls` | Xoay/zoom camera bằng chuột |
| `RuntimeGuard` | Cảnh báo console nếu vượt draw calls/triangle budget |

Khi `npm run build` — tất cả bị tree-shaken, không có trong bundle production.

### Cách dùng

```ts
// src/world/World.ts
import { BaseWorld } from '@templates/BaseWorld'
import * as THREE from 'three'

export class World extends BaseWorld {
  constructor(containerId: string) {
    super(containerId)   // ← khởi động toàn bộ engine
    this.buildScene()
  }

  private buildScene(): void {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    )
    this.scene.add(mesh)
  }

  // Ghi đè update() để chạy logic mỗi frame
  protected override update(): void {
    // this.scene.children[0].rotation.y += 0.01
  }

  // Ghi đè dispose() nếu cần dọn thêm resource
  public override dispose(): void {
    // dọn resource của World này
    super.dispose()  // ← luôn gọi super sau cùng
  }
}
```

### Properties có thể dùng trong subclass

```ts
this.scene      // THREE.Scene
this.camera     // THREE.PerspectiveCamera
this.renderer   // THREE.WebGLRenderer | null
this.container  // HTMLElement chứa canvas
```

### Khởi động từ main.ts

```ts
window.addEventListener('DOMContentLoaded', () => {
  new World('app')  // 'app' = id của element chứa canvas
})
```

---

## BaseShader.ts

**Vai trò:** Khuôn cho material/shader tùy chỉnh với dispose pattern chuẩn.

### Cấu trúc

```
BaseShader
├── createMaterial()   ← override để tạo material thật
├── setUniform()       ← cập nhật uniform tên bất kỳ
├── get()              ← lấy material để gán cho Mesh
└── dispose()          ← dọn memory GPU, có isDisposed guard
```

### Cách dùng

```ts
import { BaseShader } from '@templates/BaseShader'
import * as THREE from 'three'

export class OceanShader extends BaseShader {
  private uniforms = {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(0x0066ff) },
  }

  protected createMaterial(): THREE.Material {
    return new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `...`,    // hoặc import ?raw từ file .glsl
      fragmentShader: `...`,
    })
  }

  update(time: number): void {
    this.uniforms.uTime.value = time
  }
}

// Trong World.ts:
const shader = new OceanShader()
const mesh = new THREE.Mesh(geometry, shader.get())
scene.add(mesh)

// Khi dispose:
shader.dispose()
```

### Ưu tiên shader language (theo CLAUDE.md)

```
1. TSL  ← WebGPU, ưu tiên tuyệt đối
2. WGSL ← khi TSL không đủ, import file ?raw
3. GLSL ← khi có lý do rõ ràng, import file ?raw
```

Không inline shader string dài trong file `.ts`.

---

## BaseComponent.ts

**Vai trò:** Khuôn cho mọi object 3D độc lập trong scene — quản lý geometry, material, và tự dọn GPU memory khi bị remove.

### Cấu trúc

```
BaseComponent (abstract)
├── build()    ← abstract, BẮT BUỘC implement
├── update()   ← optional, logic mỗi frame
├── dispose()  ← tự traverse và dọn toàn bộ geometry/material con
└── mesh       ← THREE.Object3D, thêm vào scene bằng scene.add(component.mesh)
```

### Cách dùng

```ts
import { BaseComponent } from '@templates/BaseComponent'
import * as THREE from 'three'

export class Tree extends BaseComponent {
  private geometry: THREE.BufferGeometry | null = null
  private material: THREE.Material | null = null

  constructor() {
    super()
    this.build()
  }

  protected build(): void {
    this.geometry = new THREE.ConeGeometry(0.5, 2, 8)
    this.material = new THREE.MeshStandardMaterial({ color: 0x228822 })
    const trunk = new THREE.Mesh(this.geometry, this.material)
    this.mesh.add(trunk)    // thêm vào Group (this.mesh)
  }

  public override update(time: number): void {
    this.mesh.rotation.y = time * 0.5
  }
}

// Trong World.ts:
const tree = new Tree()
this.scene.add(tree.mesh)

// Khi xóa:
tree.dispose()   // tự dọn hết geometry + material + xóa khỏi scene
```

### Dispose pattern quan trọng

`BaseComponent.dispose()` tự động traverse toàn bộ mesh con và dọn sạch. Nhưng nếu class con có resource ngoài mesh (texture load tay, audio...) phải override và dọn thêm:

```ts
public override dispose(): void {
  this.extraTexture?.dispose()   // ← dọn resource thêm trước
  super.dispose()                // ← rồi mới gọi base dispose
}
```

---

## Quy tắc chung cho 3 template

1. **Không sửa file template trực tiếp** — extend thành class riêng
2. **Luôn gọi `super.dispose()`** khi override dispose
3. **Mọi resource GPU phải có dispose** — Geometry, Material, Texture
4. **Không dùng `any`** — TypeScript strict là bắt buộc
5. **Hàm không vượt 50 dòng** — tách file nếu cần (Rule 50)

---

## Sơ đồ quan hệ

```
main.ts
  └── new World('app')
        └── extends BaseWorld
              ├── scene.add(component.mesh)    ← BaseComponent
              └── mesh.material = shader.get() ← BaseShader
```
