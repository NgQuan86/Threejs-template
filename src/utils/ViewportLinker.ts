/**
 * ViewportLinker — Chuyển đổi tọa độ 3D → pixel 2D trên màn hình
 *
 * VỊ TRÍ TRONG DỰ ÁN:
 *   src/utils/ViewportLinker.ts
 *
 * VAI TRÒ:
 *   Nhận một điểm trong không gian 3D (Vector3) và trả về vị trí
 *   pixel tương ứng trên màn hình (x, y). Dùng để đặt HTML element
 *   (label, tooltip, popup) đúng vị trí đè lên canvas.
 *
 * TẠI SAO DÙNG HTML THAY VÌ CSS2DRenderer:
 *   CSS2DRenderer yêu cầu thêm renderer phụ + pass vào animation loop.
 *   ViewportLinker để World.ts tự đặt <div> bằng CSS left/top từ NDC —
 *   không tốn GPU resource thêm và dễ style hơn.
 *
 * MỐI LIÊN HỆ:
 *   World.ts (import thủ công)
 *     └── ViewportLinker   ← toScreen() gọi mỗi frame trong update()
 *           └── Vector3.project(camera)  ← Three.js built-in
 *
 *   BaseWorld KHÔNG tự dùng — World.ts phải tự import và gọi.
 *
 * CÁCH DÙNG:
 *   import { ViewportLinker } from '@utils/ViewportLinker'
 *
 *   // Trong constructor của World.ts:
 *   const linker = new ViewportLinker(this.camera, this.renderer.domElement.parentElement!)
 *
 *   // Trong update() — mỗi frame:
 *   const pos = linker.toScreen(buildingMesh.position)
 *   if (linker.isVisible(buildingMesh.position)) {
 *     labelDiv.style.left    = `${pos.x}px`
 *     labelDiv.style.top     = `${pos.y}px`
 *     labelDiv.style.display = 'block'
 *   } else {
 *     labelDiv.style.display = 'none'  // ẩn khi object sau lưng camera
 *   }
 *
 * DISPOSE:
 *   linker.dispose()   ← gọi trong World.dispose() nếu dùng
 *   Không có GPU resource — dispose chỉ dọn internal reference.
 */

import type * as THREE from 'three'

export class ViewportLinker {
  private isDisposed = false

  constructor(
    private readonly camera: THREE.Camera,
    private readonly container: HTMLElement
  ) {}

  /**
   * Chuyển vị trí 3D thành tọa độ pixel (x, y) trong container.
   * Gọi mỗi frame trong update() để label theo sát object.
   */
  toScreen(worldPosition: THREE.Vector3): { x: number; y: number } {
    if (this.isDisposed) return { x: 0, y: 0 }
    const projected = worldPosition.clone().project(this.camera)
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    return {
      x: ((projected.x + 1) / 2) * w,
      y: ((-projected.y + 1) / 2) * h,
    }
  }

  /**
   * Trả về true nếu điểm nằm phía trước camera (z ≤ 1 trong NDC).
   * Dùng để ẩn label khi object nằm sau lưng camera.
   */
  isVisible(worldPosition: THREE.Vector3): boolean {
    if (this.isDisposed) return false
    const projected = worldPosition.clone().project(this.camera)
    return projected.z <= 1
  }

  dispose(): void {
    if (this.isDisposed) return
    this.isDisposed = true
  }
}
