import Stats from 'stats.js'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { RuntimeGuard } from '@utils/RuntimeGuard'

export class BaseWorld {
  protected scene: THREE.Scene
  protected camera: THREE.PerspectiveCamera
  protected renderer: THREE.WebGLRenderer | null = null
  protected container: HTMLElement
  private devStats: Stats | null = null
  private devControls: OrbitControls | null = null
  private devGuard: RuntimeGuard | null = null

  constructor(containerId: string) {
    this.container = document.getElementById(containerId) || document.body
    this.scene = new THREE.Scene()
    this.camera = this.createCamera()
    this.init()
  }

  private createCamera(): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5
    return camera
  }

  private init(): void {
    this.setupRenderer()
    this.addEventListeners()
    if (import.meta.env.DEV) this.setupDevTools()
    this.startLoop()
  }

  private setupRenderer(): void {
    const existingCanvas = this.container.querySelector('canvas') || document.querySelector('canvas.webgl')
    this.renderer = new THREE.WebGLRenderer({
      canvas: existingCanvas as HTMLCanvasElement || undefined,
      antialias: true,
      alpha: true,
    })
    if (!existingCanvas) this.container.appendChild(this.renderer.domElement)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  private addEventListeners(): void {
    window.addEventListener('resize', () => {
      const width = window.innerWidth
      const height = window.innerHeight
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer?.setSize(width, height)
    })
  }

  private setupDevTools(): void {
    this.devStats = new Stats()
    this.devStats.showPanel(0)
    document.body.appendChild(this.devStats.dom)

    if (this.renderer) {
      this.devControls = new OrbitControls(this.camera, this.renderer.domElement)
      this.devControls.enableDamping = true
      this.devGuard = new RuntimeGuard(this.renderer)
    }
  }

  private startLoop(): void {
    this.renderer?.setAnimationLoop(() => {
      this.devStats?.begin()
      this.devControls?.update()
      this.update()
      this.renderer?.render(this.scene, this.camera)
      this.devGuard?.check()
      this.devStats?.end()
    })
  }

  protected update(): void {}

  public dispose(): void {
    this.devStats?.dom.remove()
    this.devControls?.dispose()
    this.devGuard?.dispose()
    this.renderer?.dispose()
    this.renderer?.domElement.remove()
  }
}
