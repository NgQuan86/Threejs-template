/**
 * PostProcessingManager — EffectComposer với Bloom + FXAA
 *
 * VỊ TRÍ TRONG DỰ ÁN:
 *   src/utils/PostProcessingManager.ts
 *
 * VAI TRÒ:
 *   Bao bọc THREE.EffectComposer và các pass phổ biến (Bloom, FXAA,
 *   OutputPass). Thay thế renderer.render() trong animation loop để
 *   áp dụng hiệu ứng hậu xử lý sau khi scene được render.
 *
 * TẠI SAO PHẢI OVERRIDE render() TRONG WORLD.TS:
 *   EffectComposer render vào FrameBuffer riêng → áp pass → output canvas.
 *   Nếu gọi cả renderer.render() lẫn composer.render() trong cùng 1 frame,
 *   kết quả bị ghi đè. Phải chọn 1 trong 2.
 *   → BaseWorld cung cấp protected render() để World.ts override (xem bên dưới).
 *
 * CẢNH BÁO MSAA:
 *   EffectComposer tắt hardware MSAA (render vào WebGLRenderTarget, không
 *   phải thẳng canvas). FXAA bật mặc định để bù lại. Tắt fxaa → viền răng cưa.
 *
 * PASS ORDER (thứ tự bắt buộc):
 *   1. RenderPass       ← render scene vào buffer (luôn đầu tiên)
 *   2. UnrealBloomPass  ← bloom glow (nếu bloom: true)
 *   3. ShaderPass/FXAA  ← anti-aliasing (nếu fxaa: true)
 *   4. OutputPass       ← tone mapping + gamma correction (luôn cuối)
 *
 * MỐI LIÊN HỆ:
 *   World.ts (import thủ công)
 *     └── PostProcessingManager
 *           └── EffectComposer (three/examples/jsm)
 *                 ├── RenderPass
 *                 ├── UnrealBloomPass  (optional)
 *                 ├── ShaderPass/FXAA  (optional)
 *                 └── OutputPass
 *
 *   BaseWorld.protected render() ← World.ts override để gọi composer.render()
 *
 * CÁCH DÙNG:
 *   import { PostProcessingManager } from '@utils/PostProcessingManager'
 *
 *   // Trong constructor của World.ts (sau super()):
 *   this.postProcessor = new PostProcessingManager(
 *     this.renderer!,
 *     this.scene,
 *     this.camera,
 *     { bloomStrength: 0.8, bloomThreshold: 0.7 }  // override defaults
 *   )
 *
 *   // Override render() để thay thế renderer.render():
 *   protected override render(): void {
 *     this.postProcessor.render()
 *   }
 *
 *   // Không cần gọi resize thủ công — Manager tự lắng nghe window.resize.
 *
 * OPTIONS MẶC ĐỊNH:
 *   bloom: true | bloomStrength: 0.5 | bloomRadius: 0.4 | bloomThreshold: 0.85
 *   fxaa:  true
 *
 * DISPOSE:
 *   this.postProcessor.dispose()  ← gọi trong World.dispose()
 *   Tự remove resize listener + dispose EffectComposer.
 */

import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'

interface PostProcessingOptions {
  bloom: boolean
  bloomStrength: number
  bloomRadius: number
  bloomThreshold: number
  fxaa: boolean
}

const defaultOptions: PostProcessingOptions = {
  bloom: true,
  bloomStrength: 0.5,
  bloomRadius: 0.4,
  bloomThreshold: 0.85,
  fxaa: true,
}

export class PostProcessingManager {
  private readonly composer: EffectComposer
  private fxaaPass: ShaderPass | null = null
  private readonly boundResize: () => void
  private isDisposed = false

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    options?: Partial<PostProcessingOptions>
  ) {
    const opts = { ...defaultOptions, ...options }
    this.composer = new EffectComposer(renderer)
    this.composer.addPass(new RenderPass(scene, camera))
    if (opts.bloom) this.addBloomPass(opts)
    if (opts.fxaa) this.addFXAAPass()
    this.composer.addPass(new OutputPass())
    this.boundResize = this.handleResize.bind(this)
    window.addEventListener('resize', this.boundResize)
  }

  /** Gọi trong World.ts: `protected override render() { this.postProcessor.render() }` */
  render(): void {
    if (this.isDisposed) return
    this.composer.render()
  }

  dispose(): void {
    if (this.isDisposed) return
    this.isDisposed = true
    window.removeEventListener('resize', this.boundResize)
    this.composer.dispose()
  }

  private addBloomPass(opts: PostProcessingOptions): void {
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      opts.bloomStrength,
      opts.bloomRadius,
      opts.bloomThreshold
    )
    this.composer.addPass(bloom)
  }

  private addFXAAPass(): void {
    this.fxaaPass = new ShaderPass(FXAAShader)
    const res = this.fxaaPass.uniforms['resolution']
    if (res?.value instanceof THREE.Vector2) {
      res.value.set(1 / window.innerWidth, 1 / window.innerHeight)
    }
    this.composer.addPass(this.fxaaPass)
  }

  private handleResize(): void {
    const w = window.innerWidth
    const h = window.innerHeight
    this.composer.setSize(w, h)
    if (this.fxaaPass) {
      const res = this.fxaaPass.uniforms['resolution']
      if (res?.value instanceof THREE.Vector2) {
        res.value.set(1 / w, 1 / h)
      }
    }
  }
}
