/**
 * World — Quản lý logic toàn bộ thế giới 3D
 *
 * VỊ TRÍ TRONG DỰ ÁN:
 *   src/world/World.ts
 *
 * VAI TRÒ:
 *   Là trung tâm điều phối (Orchestrator).
 *   Kết nối UI (LoadingScreen), Dữ liệu (ResourceLoader) và Đồ họa (Three.js Scene).
 *
 * MỐI LIÊN HỆ:
 *   World (Chủ) ──> LoadingScreen (Thợ UI)
 *   World (Chủ) ──> ResourceLoader (Thợ khuân vác)
 *
 * CÁCH DÙNG:
 *   Được khởi tạo 1 lần duy nhất trong main.ts.
 */

import { BaseShader } from '@templates/BaseShader'
import { BaseWorld } from '@templates/BaseWorld'
import { GlobalUniforms } from '@utils/GlobalUniforms'
import * as THREE from 'three'

import { LoadingScreen } from '@/utils/LoadingScreen'

export class World extends BaseWorld {
  private loadingScreen: LoadingScreen

  constructor(containerId: string) {
    super(containerId)
    this.loadingScreen = new LoadingScreen()
    this.initScene()
  }

  private customShader: BaseShader | null = null
  private testMesh: THREE.Mesh | null = null

  private async initScene(): Promise<void> {
    // Giả lập việc tải tài nguyên (Texture, Model...)
    // Trong thực tế, bạn sẽ dùng: await this.loader.loadGLTF(...)
    await this.simulateLoading()

    // Xây dựng vật thể sau khi tải xong
    this.addTestObjects()
    this.camera.position.set(2, 2, 2)
    this.camera.lookAt(0, 0, 0)

    // 4. Ẩn màn hình loading với hiệu ứng mượt
    await this.loadingScreen.hide()
  }

  /** 🧪 Giả lập tiến trình tải để test visual của LoadingScreen */
  private async simulateLoading(): Promise<void> {
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += 5
        this.loadingScreen.onProgress('simulated_asset.glb', progress, 100)

        if (progress >= 100) {
          clearInterval(interval)
          resolve()
        }
      }, 100)
    })
  }

  private addTestObjects(): void {
    // Test BaseShader (với uniform uIntensity, uColor)
    this.customShader = new BaseShader({
      intensity: 1.5,
      color: new THREE.Color(0x00ffcc),
    })

    const geometry = new THREE.BoxGeometry(1, 1, 1)
    this.testMesh = new THREE.Mesh(geometry, this.customShader.getMaterial())
    this.scene.add(this.testMesh)
  }

  protected override update(delta: number, _time: number): void {
    // Update global uniforms mỗi frame
    GlobalUniforms.getInstance().update(delta)

    // Animate test mesh để thấy shader/uniform hoạt động
    if (this.testMesh) {
      this.testMesh.rotation.x += delta * 0.5
      this.testMesh.rotation.y += delta * 0.5
      this.testMesh.position.y = Math.sin(GlobalUniforms.getInstance().uTime.value * 2) * 0.5
    }
  }

  public override dispose(): void {
    super.dispose()

    this.customShader?.dispose()
    this.testMesh?.geometry.dispose()
    this.testMesh?.parent?.remove(this.testMesh)

    GlobalUniforms.getInstance().dispose()
  }
}
