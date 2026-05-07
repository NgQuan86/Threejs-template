/**
 * ResourceLoader — Quản lý tải và cache tài nguyên 3D
 *
 * VỊ TRÍ TRONG DỰ ÁN:
 *   src/utils/ResourceLoader.ts
 *   Được import trực tiếp vào World.ts khi cần load asset.
 *   BaseWorld không biết class này tồn tại.
 *
 * VAI TRÒ:
 *   Tải file từ server về (Texture, GLTF model, HDR environment map)
 *   và giữ lại trong bộ nhớ (cache) để tránh tải lại cùng file 2 lần.
 *   Tự động giải mã file GLTF được nén bằng Draco geometry compression.
 *
 * DRACO COMPRESSION:
 *   GLTF thô (không nén) → GLTF + Draco (nén geometry 70–90%).
 *   Loader tự nhận diện: file có Draco → dùng DRACOLoader, file thường → bỏ qua.
 *   Yêu cầu: copy decoder WASM vào static/draco/ (xem hướng dẫn bên dưới).
 *
 *   Cách copy decoder (chạy 1 lần):
 *     cp -r node_modules/three/examples/jsm/libs/draco/ static/draco/
 *   Hoặc trên Windows:
 *     xcopy /E /I node_modules\three\examples\jsm\libs\draco static\draco
 *
 * MỐI LIÊN HỆ:
 *   ┌─────────────┐   onProgress callback   ┌──────────────┐
 *   │ LoadingScreen│ ←────────────────────── │ResourceLoader│
 *   └─────────────┘                          └──────────────┘
 *          ↑                                        ↑
 *          └──────────── World.ts kết nối ──────────┘
 *
 *   ResourceLoader KHÔNG biết LoadingScreen tồn tại.
 *   Chỉ báo cáo tiến độ qua onProgress — ai lắng nghe là việc của World.ts.
 *
 * CÁCH DÙNG TRONG World.ts:
 *   const screen = new LoadingScreen()
 *   const loader = new ResourceLoader(screen.onProgress.bind(screen))
 *   const texture = await loader.loadTexture('/textures/wood.jpg')
 *   const model   = await loader.loadGLTF('/models/scene.glb')        // thường
 *   const modelDraco = await loader.loadGLTF('/models/city.glb')      // Draco — tự động
 *   const env     = await loader.loadHDR('/hdr/studio.hdr')
 *   await screen.hide()
 *
 * KHI NÀO CẦN:
 *   Chỉ cần khi scene load file thật từ thư mục public/.
 *   Scene tạo object bằng code thuần (BoxGeometry...) không cần class này.
 *
 * DISPOSE:
 *   loader.dispose() — giải phóng toàn bộ Texture/HDR khỏi GPU + dispose DRACOLoader.
 *   Gọi khi destroy scene hoặc chuyển sang scene khác.
 *   GLTF không dispose ở đây vì geometry/material của nó nằm trong scene.
 */

import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { type GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

type ProgressCallback = (url: string, loaded: number, total: number) => void

export class ResourceLoader {
  // ─── Loaders ──────────────────────────────────────────────────────────────
  private manager: THREE.LoadingManager
  private textureLoader: THREE.TextureLoader
  private gltfLoader: GLTFLoader
  private dracoLoader: DRACOLoader
  private hdrLoader: RGBELoader

  // ─── Cache ────────────────────────────────────────────────────────────────
  // Map<url, asset> — tránh load lại cùng file 2 lần trong cùng scene
  private textureCache = new Map<string, THREE.Texture>()
  private gltfCache = new Map<string, GLTF>()
  private hdrCache = new Map<string, THREE.DataTexture>()

  private isDisposed = false

  constructor(onProgress?: ProgressCallback) {
    // ─── LoadingManager ─────────────────────────────────────────────────────
    // Manager trung tâm — tất cả loader đều report tiến độ qua đây
    this.manager = new THREE.LoadingManager()
    this.manager.onError = (url) => console.error(`[ResourceLoader] Failed: ${url}`)
    if (onProgress) this.manager.onProgress = onProgress

    // ─── Khởi tạo các loader ────────────────────────────────────────────────
    this.textureLoader = new THREE.TextureLoader(this.manager)
    this.hdrLoader = new RGBELoader(this.manager)

    // DRACOLoader: giải mã geometry nén — path trỏ đến WASM decoder trong static/draco/
    // File không có Draco sẽ được GLTFLoader xử lý bình thường, DRACOLoader bị bỏ qua
    this.dracoLoader = new DRACOLoader()
    this.dracoLoader.setDecoderPath('/draco/')

    this.gltfLoader = new GLTFLoader(this.manager)
    this.gltfLoader.setDRACOLoader(this.dracoLoader)
  }

  // ─── Load methods ─────────────────────────────────────────────────────────

  loadTexture(url: string): Promise<THREE.Texture> {
    const cached = this.textureCache.get(url)
    if (cached) return Promise.resolve(cached)
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          this.textureCache.set(url, texture)
          resolve(texture)
        },
        undefined,
        reject
      )
    })
  }

  /** Load GLTF thường hoặc GLTF đã nén Draco — tự nhận diện, không cần chỉ định. */
  loadGLTF(url: string): Promise<GLTF> {
    const cached = this.gltfCache.get(url)
    if (cached) return Promise.resolve(cached)
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          this.gltfCache.set(url, gltf)
          resolve(gltf)
        },
        undefined,
        reject
      )
    })
  }

  loadHDR(url: string): Promise<THREE.DataTexture> {
    const cached = this.hdrCache.get(url)
    if (cached) return Promise.resolve(cached)
    return new Promise((resolve, reject) => {
      this.hdrLoader.load(
        url,
        (texture) => {
          this.hdrCache.set(url, texture)
          resolve(texture)
        },
        undefined,
        reject
      )
    })
  }

  // ─── Dispose ──────────────────────────────────────────────────────────────

  dispose(): void {
    if (this.isDisposed) return
    this.textureCache.forEach((t) => t.dispose())
    this.hdrCache.forEach((t) => t.dispose())
    this.textureCache.clear()
    this.gltfCache.clear()
    this.hdrCache.clear()
    this.dracoLoader.dispose()
    this.isDisposed = true
  }
}
