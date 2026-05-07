/**
 * InteractionHelper — Wrapper Raycaster cho hover/click vào object 3D
 *
 * VỊ TRÍ TRONG DỰ ÁN:
 *   src/utils/InteractionHelper.ts
 *
 * VAI TRÒ:
 *   Bao bọc THREE.Raycaster + sự kiện chuột để World.ts có thể đăng ký
 *   hover/click vào object 3D chỉ với vài dòng — không cần viết lại
 *   logic NDC, intersectObjects, hay quản lý event listener thủ công.
 *
 * MỐI LIÊN HỆ:
 *   World.ts (import thủ công)
 *     └── InteractionHelper
 *           ├── canvas.addEventListener('mousemove') ← tự lắng nghe
 *           ├── canvas.addEventListener('click')     ← tự lắng nghe
 *           └── THREE.Raycaster.intersectObjects()   ← Three.js built-in
 *
 *   BaseWorld KHÔNG tự dùng — World.ts phải import và gọi dispose().
 *
 * CÁCH DÙNG:
 *   import { InteractionHelper } from '@utils/InteractionHelper'
 *
 *   // Trong constructor:
 *   const helper = new InteractionHelper(this.camera, this.renderer.domElement)
 *
 *   // Đăng ký hover — callback nhận object đang hover, hoặc null khi rời:
 *   helper.onHover([buildingMesh, roadMesh], (obj) => {
 *     document.body.style.cursor = obj ? 'pointer' : 'default'
 *   })
 *
 *   // Đăng ký click — callback chỉ gọi khi có hit:
 *   helper.onClick([buildingMesh], (obj) => {
 *     console.log('Clicked:', obj.name)
 *   })
 *
 *   // Thay đổi danh sách object bất kỳ lúc nào:
 *   helper.onHover([newMesh], callback)   // ghi đè registration cũ
 *
 * DISPOSE — BẮT BUỘC:
 *   helper.dispose()  ← PHẢI gọi trong World.dispose()
 *   Nếu quên: mousemove listener tồn tại mãi trên canvas → DOM memory leak.
 */

import * as THREE from 'three'

type HoverCallback = (object: THREE.Object3D | null) => void
type ClickCallback = (object: THREE.Object3D) => void

export class InteractionHelper {
  private readonly raycaster = new THREE.Raycaster()
  private readonly mouse = new THREE.Vector2()
  private hoverObjects: THREE.Object3D[] = []
  private clickObjects: THREE.Object3D[] = []
  private hoverCallback: HoverCallback | null = null
  private clickCallback: ClickCallback | null = null
  private currentHovered: THREE.Object3D | null = null
  private isDisposed = false

  private readonly boundMouseMove: (e: MouseEvent) => void
  private readonly boundClick: (e: MouseEvent) => void

  constructor(
    private readonly camera: THREE.Camera,
    private readonly canvas: HTMLElement
  ) {
    this.boundMouseMove = this.handleMouseMove.bind(this)
    this.boundClick = this.handleClick.bind(this)
    canvas.addEventListener('mousemove', this.boundMouseMove)
    canvas.addEventListener('click', this.boundClick)
  }

  /** Đăng ký objects cần hover. Callback nhận object đang hover hoặc null khi rời. */
  onHover(objects: THREE.Object3D[], callback: HoverCallback): void {
    this.hoverObjects = objects
    this.hoverCallback = callback
  }

  /** Đăng ký objects cần click. Callback chỉ gọi khi có hit. */
  onClick(objects: THREE.Object3D[], callback: ClickCallback): void {
    this.clickObjects = objects
    this.clickCallback = callback
  }

  private updateMouse(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    this.raycaster.setFromCamera(this.mouse, this.camera)
  }

  private getFirstHit(objects: THREE.Object3D[]): THREE.Object3D | null {
    if (objects.length === 0) return null
    const hits = this.raycaster.intersectObjects(objects, true)
    return hits.length > 0 ? hits[0].object : null
  }

  private handleMouseMove(event: MouseEvent): void {
    if (this.isDisposed || !this.hoverCallback) return
    this.updateMouse(event)
    const hit = this.getFirstHit(this.hoverObjects)
    if (hit !== this.currentHovered) {
      this.currentHovered = hit
      this.hoverCallback(hit)
    }
  }

  private handleClick(event: MouseEvent): void {
    if (this.isDisposed || !this.clickCallback) return
    this.updateMouse(event)
    const hit = this.getFirstHit(this.clickObjects)
    if (hit) this.clickCallback(hit)
  }

  dispose(): void {
    if (this.isDisposed) return
    this.isDisposed = true
    this.canvas.removeEventListener('mousemove', this.boundMouseMove)
    this.canvas.removeEventListener('click', this.boundClick)
    this.hoverObjects = []
    this.clickObjects = []
    this.hoverCallback = null
    this.clickCallback = null
  }
}
