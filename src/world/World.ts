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

import { BaseWorld } from '@templates/BaseWorld'
import * as THREE from 'three'

import { LoadingScreen } from '@/utils/LoadingScreen'

export class World extends BaseWorld {
  private loadingScreen: LoadingScreen

  constructor(containerId: string) {
    super(containerId)
    this.loadingScreen = new LoadingScreen()
    this.initScene()
  }

  private async initScene(): Promise<void> {
    // Giả lập việc tải tài nguyên (Texture, Model...)
    // Trong thực tế, bạn sẽ dùng: await this.loader.loadGLTF(...)
    await this.simulateLoading()

    // Xây dựng vật thể sau khi tải xong
    this.addRedBox()
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

  private addRedBox(): void {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    const mesh = new THREE.Mesh(geometry, material)
    this.scene.add(mesh)
  }

  protected override update(): void {}
}
