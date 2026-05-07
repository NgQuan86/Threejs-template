import * as THREE from 'three'
// Lưu ý: Trong tương lai sẽ import từ 'three/tsl' hoặc 'three/nodes'
// Hiện tại chúng ta chuẩn bị cấu trúc cho NodeMaterial.

/**
 * 🌈 BaseShader: Khuôn mẫu cho vật liệu tùy chỉnh (Shaders).
 * Tập trung vào sử dụng Node-based Material (tương lai của Three.js).
 */
export class BaseShader {
  private material: THREE.Material
  private isDisposed = false

  constructor() {
    this.material = this.createMaterial()
  }

  /** 🎨 Tạo vật liệu (Có thể mở rộng để dùng TSL / NodeMaterial) */
  private createMaterial(): THREE.Material {
    // Placeholder cho vật liệu tiêu chuẩn
    // Sau này AI sẽ thay thế bằng các nút logic (TSL) tại đây
    return new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      roughness: 0.5,
      metalness: 0.5,
    })
  }

  /** ⚙️ Cập nhật các biến số (Uniforms) trong shader */
  public setUniform(name: string, value: unknown): void {
    if (this.material.userData.uniforms) {
      this.material.userData.uniforms[name] = value
    }
  }

  /** 🧹 Giải phóng bộ nhớ vật liệu */
  public dispose(): void {
    if (this.isDisposed) return

    this.material.dispose()
    this.isDisposed = true
    console.log('[BaseShader] Vật liệu đã được giải phóng.')
  }

  /** 📦 Trả về vật liệu để gán cho Mesh */
  public get(): THREE.Material {
    return this.material
  }
}
