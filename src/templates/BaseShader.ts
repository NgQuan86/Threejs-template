import type * as THREE from 'three'
import { ShaderMaterial } from 'three'

/**
 * Interface cho các uniform được phép truyền vào shader
 */
export interface BaseShaderOptions {
  intensity?: number
  color?: THREE.Color
}

/**
 * 🌈 BaseShader: Canonical reference cho mọi custom shader.
 * Áp dụng triệt để dispose-pattern và shader-tsl skill.
 */
export class BaseShader {
  private material: ShaderMaterial | null = null
  private isDisposed = false

  constructor(opts: BaseShaderOptions = {}) {
    this.material = new ShaderMaterial({
      // Trong tương lai sẽ import TSL NodeMaterial tại đây
      uniforms: {
        uIntensity: { value: opts.intensity ?? 1.0 },
        uColor: { value: opts.color ?? ({ isColor: true, r: 1, g: 1, b: 1 } as THREE.Color) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uIntensity;
        uniform vec3 uColor;
        varying vec2 vUv;
        void main() {
          gl_FragColor = vec4(uColor * uIntensity, 1.0);
        }
      `,
    })
  }

  /**
   * Cập nhật cường độ sáng. Range [0, 10].
   */
  public setIntensity(value: number): void {
    if (this.isDisposed || !this.material) return
    if (Number.isNaN(value)) return
    this.material.uniforms.uIntensity.value = Math.max(0, Math.min(10, value))
  }

  /**
   * Lấy material để gán vào mesh
   */
  public getMaterial(): ShaderMaterial {
    if (!this.material) throw new Error(`${this.constructor.name}: đã dispose`)
    return this.material
  }

  /**
   * 🧹 Giải phóng bộ nhớ vật liệu (Must-Dispose)
   */
  public dispose(): void {
    if (this.isDisposed) return

    this.material?.dispose()
    this.material = null
    this.isDisposed = true

    console.log('[BaseShader] Vật liệu đã được giải phóng.')
  }
}
