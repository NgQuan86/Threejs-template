import * as THREE from 'three'
import { type GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

type ProgressCallback = (url: string, loaded: number, total: number) => void

export class ResourceLoader {
  private manager: THREE.LoadingManager
  private textureLoader: THREE.TextureLoader
  private gltfLoader: GLTFLoader
  private hdrLoader: RGBELoader
  private textureCache = new Map<string, THREE.Texture>()
  private gltfCache = new Map<string, GLTF>()
  private hdrCache = new Map<string, THREE.DataTexture>()
  private isDisposed = false

  constructor(onProgress?: ProgressCallback) {
    this.manager = new THREE.LoadingManager()
    this.manager.onError = (url) => console.error(`[ResourceLoader] Failed: ${url}`)
    if (onProgress) this.manager.onProgress = onProgress
    this.textureLoader = new THREE.TextureLoader(this.manager)
    this.gltfLoader = new GLTFLoader(this.manager)
    this.hdrLoader = new RGBELoader(this.manager)
  }

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

  dispose(): void {
    if (this.isDisposed) return
    this.textureCache.forEach((t) => t.dispose())
    this.hdrCache.forEach((t) => t.dispose())
    this.textureCache.clear()
    this.gltfCache.clear()
    this.hdrCache.clear()
    this.isDisposed = true
  }
}
