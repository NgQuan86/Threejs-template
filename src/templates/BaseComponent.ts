import * as THREE from 'three'

/**
 * 📦 BaseComponent: Khuôn mẫu cho mọi vật thể 3D trong scene.
 * Giúp quản lý vòng đời của vật thể và giải phóng bộ nhớ GPU tự động.
 */
export abstract class BaseComponent {
  public mesh: THREE.Object3D
  protected isDisposed = false

  constructor() {
    // Khởi tạo Mesh hoặc Group rỗng
    this.mesh = new THREE.Group()
  }

  /** 🏗 Phương thức bắt buộc để xây dựng hình khối và vật liệu */
  protected abstract build(): void

  /** 🔄 Cập nhật logic theo từng frame (nếu cần) */
  public update(_time: number): void {}

  /**
   * 🧹 Dispose Pattern: Cực kỳ quan trọng để tránh rò rỉ bộ nhớ GPU.
   * Giải phóng Geometries, Materials và Textures.
   */
  public dispose(): void {
    if (this.isDisposed) return

    this.mesh.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        this.cleanMesh(object)
      }
    })

    // Xóa khỏi Scene cha
    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh)
    }

    this.isDisposed = true
    console.log(`[BaseComponent] Đã dọn dẹp: ${this.mesh.type}`)
  }

  /** 🧼 Chi tiết dọn dẹp từng Mesh con */
  private cleanMesh(mesh: THREE.Mesh): void {
    // Giải phóng hình khối
    mesh.geometry.dispose()

    // Giải phóng vật liệu (xử lý cả trường hợp mảng vật liệu)
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((m) => m.dispose())
    } else {
      mesh.material.dispose()
    }
  }
}
