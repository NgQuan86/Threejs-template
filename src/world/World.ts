import { BaseWorld } from '@templates/BaseWorld'
import * as THREE from 'three'

export class World extends BaseWorld {
  constructor(containerId: string) {
    super(containerId)
    this.addRedBox()
    this.camera.position.set(2, 2, 2)
    this.camera.lookAt(0, 0, 0)
  }

  private addRedBox(): void {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    const mesh = new THREE.Mesh(geometry, material)
    this.scene.add(mesh)
  }

  protected override update(): void {}
}
