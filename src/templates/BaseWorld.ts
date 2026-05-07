/**
 * BaseWorld — Template gốc cho mọi scene Three.js trong dự án
 *
 * VỊ TRÍ TRONG DỰ ÁN:
 *   src/templates/BaseWorld.ts
 *
 * VAI TRÒ:
 *   Lớp cơ sở (abstract-like) chứa boilerplate không bao giờ thay đổi:
 *   - Khởi tạo Scene, Camera, WebGLRenderer
 *   - Animation loop (setAnimationLoop)
 *   - Resize handler (tự động cập nhật aspect ratio + renderer size)
 *   - Dev tools: Stats.js, Tweakpane, OrbitControls, RuntimeGuard (dev-only)
 *
 * MỐI LIÊN HỆ:
 *   World.ts  ──extends──>  BaseWorld
 *
 *   BaseWorld sở hữu toàn bộ infrastructure:
 *     scene, camera, renderer  ← protected, World.ts dùng trực tiếp
 *     devPane                  ← protected, World.ts có thể thêm debug controls
 *     update()                 ← protected, World.ts override để thêm logic/frame
 *     render()                 ← protected, World.ts override để dùng PostProcessing
 *
 *   Các utils BaseWorld TỰ quản lý (World.ts không cần biết):
 *     RuntimeGuard  ← check draw calls/triangles mỗi frame (dev-only)
 *     Stats.js      ← FPS counter góc trái trên (dev-only)
 *     OrbitControls ← xoay camera bằng chuột (dev-only)
 *
 * CÁCH DÙNG:
 *   // World.ts chỉ cần extends và override 2 method:
 *   export class World extends BaseWorld {
 *     constructor(containerId: string) {
 *       super(containerId)
 *       this.initScene()   // async setup riêng
 *     }
 *
 *     protected override update(): void {
 *       // Logic mỗi frame: di chuyển object, update physics...
 *       mesh.rotation.y += 0.01
 *     }
 *
 *     // Override render() KHI dùng PostProcessingManager:
 *     protected override render(): void {
 *       this.postProcessor.render()   // thay thế renderer.render()
 *     }
 *   }
 *
 * DEV TOOLS — chỉ chạy khi npm run dev:
 *   - Stats.js: FPS/MS/MB panel, góc trái trên màn hình
 *   - Tweakpane: debug panel, truy cập qua this.devPane trong World.ts
 *   - OrbitControls: kéo/zoom/xoay camera bằng chuột
 *   - RuntimeGuard: cảnh báo khi vượt draw call / triangle budget
 *   Tất cả bị tree-shaken trong production build (import.meta.env.DEV).
 *
 * RESIZE:
 *   BaseWorld tự lắng nghe window.resize — cập nhật camera.aspect +
 *   renderer.setSize(). World.ts không cần làm gì thêm.
 *   Lưu ý: listener dùng closure ẩn danh, không remove được khi dispose.
 *   Nếu dùng PostProcessingManager, Manager tự lắng nghe resize riêng.
 *
 * DISPOSE:
 *   world.dispose()  ← gọi khi unmount/chuyển scene
 *   Dọn dẹp: devPane, Stats, OrbitControls, RuntimeGuard, renderer DOM.
 */

import { RuntimeGuard } from '@utils/RuntimeGuard'
import Stats from 'stats.js'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Pane } from 'tweakpane'

export class BaseWorld {
  // ─── Core Three.js objects ────────────────────────────────────────────────
  // protected → World.ts có thể đọc/dùng trực tiếp, bên ngoài class không thấy
  protected scene: THREE.Scene
  protected camera: THREE.PerspectiveCamera
  protected renderer: THREE.WebGLRenderer | null = null
  protected container: HTMLElement

  // ─── Dev tools ────────────────────────────────────────────────────────────
  // devPane là protected để World.ts có thể thêm slider/button debug riêng
  // devStats, devControls, devGuard là private — BaseWorld tự quản lý hoàn toàn
  protected devPane: Pane | null = null
  private devStats: Stats | null = null
  private devControls: OrbitControls | null = null
  private devGuard: RuntimeGuard | null = null

  // ─── Constructor ──────────────────────────────────────────────────────────
  // Chỉ nhận containerId — tìm element trong DOM, fallback về document.body
  // Thứ tự init bắt buộc: camera trước (renderer cần aspect ratio), rồi mới init()
  constructor(containerId: string) {
    this.container = document.getElementById(containerId) || document.body
    this.scene = new THREE.Scene()
    this.camera = this.createCamera()
    this.init()
  }

  // ─── Setup: Camera ────────────────────────────────────────────────────────
  // FOV 75° là giá trị chuẩn cho scene kiến trúc — không quá méo, không quá hẹp
  // near 0.1 / far 1000 phù hợp với scale "1 unit = 1 mét"
  private createCamera(): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 5
    return camera
  }

  // ─── Setup: Init pipeline ─────────────────────────────────────────────────
  // Thứ tự gọi có ý nghĩa: renderer phải tồn tại trước khi setup dev tools
  private init(): void {
    this.setupRenderer()
    this.addEventListeners()
    if (import.meta.env.DEV) this.setupDevTools()
    this.startLoop()
  }

  // ─── Setup: Renderer ──────────────────────────────────────────────────────
  // Tái dùng canvas có sẵn trong DOM nếu có (class="webgl") — tránh tạo 2 canvas
  // pixelRatio cap ở 2 để tránh render 3x trên màn hình Retina cao hơn
  private setupRenderer(): void {
    const existingCanvas =
      this.container.querySelector('canvas') || document.querySelector('canvas.webgl')
    this.renderer = new THREE.WebGLRenderer({
      canvas: (existingCanvas as HTMLCanvasElement) || undefined,
      antialias: true,
      alpha: true,
    })
    if (!existingCanvas) this.container.appendChild(this.renderer.domElement)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  // ─── Setup: Resize handler ────────────────────────────────────────────────
  // Closure ẩn danh — không lưu reference nên không remove được trong dispose()
  // PostProcessingManager tự thêm listener riêng để update composer + FXAA
  private addEventListeners(): void {
    window.addEventListener('resize', () => {
      const width = window.innerWidth
      const height = window.innerHeight
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer?.setSize(width, height)
    })
  }

  // ─── Setup: Dev tools (dev-only) ──────────────────────────────────────────
  // Toàn bộ block này bị tree-shaken khi build production (import.meta.env.DEV = false)
  // Stats panel 0 = FPS | panel 1 = MS per frame | panel 2 = MB heap
  private setupDevTools(): void {
    this.devStats = new Stats()
    this.devStats.showPanel(0)
    document.body.appendChild(this.devStats.dom)

    this.devPane = new Pane({ title: 'Debug' })

    if (this.renderer) {
      this.devControls = new OrbitControls(this.camera, this.renderer.domElement)
      this.devControls.enableDamping = true
      this.devGuard = new RuntimeGuard(this.renderer)
    }
  }

  // ─── Animation loop ───────────────────────────────────────────────────────
  // setAnimationLoop thay thế requestAnimationFrame — tương thích với WebXR
  // Thứ tự trong loop: stats.begin → controls.update → update() → render() → guard.check → stats.end
  private startLoop(): void {
    this.renderer?.setAnimationLoop(() => {
      this.devStats?.begin()
      this.devControls?.update()
      this.update()
      this.render()
      this.devGuard?.check()
      this.devStats?.end()
    })
  }

  // ─── Overridable hooks ────────────────────────────────────────────────────
  // World.ts override update() để thêm logic per-frame (animation, physics...)
  // World.ts override render() KHI dùng PostProcessingManager thay renderer.render()
  protected update(): void {}

  protected render(): void {
    this.renderer?.render(this.scene, this.camera)
  }

  // ─── Dispose ──────────────────────────────────────────────────────────────
  // Gọi khi chuyển scene hoặc unmount — dọn DOM và giải phóng GPU context
  // renderer.domElement.remove() xóa canvas khỏi DOM
  public dispose(): void {
    this.devPane?.dispose()
    this.devStats?.dom.remove()
    this.devControls?.dispose()
    this.devGuard?.dispose()
    this.renderer?.dispose()
    this.renderer?.domElement.remove()
  }
}
