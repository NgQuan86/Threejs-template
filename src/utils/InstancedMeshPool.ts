/**
 * InstancedMeshPool — Render nhiều object giống nhau với 1 draw call duy nhất
 *
 * VỊ TRÍ TRONG DỰ ÁN:
 *   src/utils/InstancedMeshPool.ts
 *
 * VAI TRÒ:
 *   Tạo và quản lý một THREE.InstancedMesh — render hàng chục/hàng trăm
 *   bản sao của cùng geometry + material chỉ với 1 draw call.
 *   Thay vì add 50 Mesh riêng lẻ (= 50 draw calls), Pool gộp tất cả
 *   thành 1 InstancedMesh (= 1 draw call).
 *
 * TẠI SAO QUAN TRỌNG VỚI "KHU PHỐ":
 *   Cây, đèn đường, ghế đá, xe giống nhau... nếu add riêng lẻ sẽ bùng
 *   nổ draw calls vượt budget 100/frame. InstancedMesh là kỹ thuật bắt
 *   buộc với mọi city/architecture scene.
 *
 *   Ví dụ hiệu quả:
 *     50 cây riêng lẻ  = 50 draw calls  ❌
 *     50 cây qua Pool  =  1 draw call   ✅
 *
 * MỐI LIÊN HỆ:
 *   World.ts (import thủ công)
 *     └── InstancedMeshPool   ← quản lý 1 loại object (cây, đèn, xe...)
 *           └── THREE.InstancedMesh  ← tự add vào scene trong constructor
 *
 *   BaseWorld KHÔNG tự dùng — World.ts phải import và gọi dispose().
 *   Mỗi loại object cần 1 Pool riêng:
 *     new InstancedMeshPool(treeGeo, treeMat, 50, scene)   ← Pool cây
 *     new InstancedMeshPool(lampGeo, lampMat, 20, scene)   ← Pool đèn
 *
 * CÁCH DÙNG:
 *   import { InstancedMeshPool } from '@utils/InstancedMeshPool'
 *
 *   // Geometry + Material phải dành riêng cho Pool — KHÔNG dùng chung:
 *   const treePool = new InstancedMeshPool(
 *     new THREE.CylinderGeometry(0.1, 0.3, 2),
 *     new THREE.MeshStandardMaterial({ color: 0x228B22 }),
 *     50,           // maxCount — cấp phát 1 lần, không resize được
 *     this.scene
 *   )
 *
 *   // Thêm instance — trả về index để update sau:
 *   const i0 = treePool.addInstance(new THREE.Vector3(1, 0, 2))
 *   const i1 = treePool.addInstance(
 *     new THREE.Vector3(5, 0, -3),
 *     new THREE.Euler(0, Math.PI / 4, 0)   // rotation
 *   )
 *   const i2 = treePool.addInstance(
 *     new THREE.Vector3(-2, 0, 8),
 *     undefined,
 *     new THREE.Vector3(1.5, 2, 1.5)       // scale
 *   )
 *
 *   // Cập nhật vị trí instance đã add (dùng cho animation):
 *   treePool.updateInstance(i0, new THREE.Vector3(1, 1, 2))
 *
 * GIỚI HẠN:
 *   - maxCount phải xác định trước — không resize được sau khi tạo
 *   - Thêm vượt maxCount: bị bỏ qua + console.warn
 *   - Geometry + Material truyền vào bị dispose() khi Pool bị destroy
 *     → Đừng dùng chung với mesh khác trong scene
 *
 * DISPOSE:
 *   treePool.dispose()   ← tự remove khỏi scene + dispose geometry + material
 *   Gọi trong World.dispose() cho mọi Pool đã tạo.
 */

import * as THREE from 'three'

export class InstancedMeshPool {
  private readonly mesh: THREE.InstancedMesh
  private readonly dummy = new THREE.Object3D()
  private count = 0
  private isDisposed = false

  constructor(
    private readonly geometry: THREE.BufferGeometry,
    private readonly material: THREE.Material,
    private readonly maxCount: number,
    private readonly scene: THREE.Scene
  ) {
    this.mesh = new THREE.InstancedMesh(geometry, material, maxCount)
    this.mesh.count = 0
    scene.add(this.mesh)
  }

  /**
   * Thêm 1 instance mới. Trả về index để dùng với updateInstance().
   * Trả về -1 nếu đã đạt maxCount.
   */
  addInstance(position: THREE.Vector3, rotation?: THREE.Euler, scale?: THREE.Vector3): number {
    if (this.isDisposed) return -1
    if (this.count >= this.maxCount) {
      console.warn(`[InstancedMeshPool] maxCount (${this.maxCount}) reached — instance ignored`)
      return -1
    }
    const index = this.count++
    this.applyMatrix(index, position, rotation, scale)
    this.mesh.count = this.count
    return index
  }

  /**
   * Cập nhật transform của instance theo index. Dùng cho animation.
   */
  updateInstance(
    index: number,
    position: THREE.Vector3,
    rotation?: THREE.Euler,
    scale?: THREE.Vector3
  ): void {
    if (this.isDisposed || index < 0 || index >= this.count) return
    this.applyMatrix(index, position, rotation, scale)
  }

  private applyMatrix(
    index: number,
    position: THREE.Vector3,
    rotation?: THREE.Euler,
    scale?: THREE.Vector3
  ): void {
    this.dummy.position.copy(position)
    if (rotation) this.dummy.rotation.copy(rotation)
    else this.dummy.rotation.set(0, 0, 0)
    if (scale) this.dummy.scale.copy(scale)
    else this.dummy.scale.setScalar(1)
    this.dummy.updateMatrix()
    this.mesh.setMatrixAt(index, this.dummy.matrix)
    this.mesh.instanceMatrix.needsUpdate = true
  }

  dispose(): void {
    if (this.isDisposed) return
    this.isDisposed = true
    this.scene.remove(this.mesh)
    this.geometry.dispose()
    this.material.dispose()
  }
}
