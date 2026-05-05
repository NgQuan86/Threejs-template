interface RendererInfo {
  info: {
    render: { calls: number; triangles: number }
    memory: { geometries: number }
  }
}

interface GuardOptions {
  drawCallLimit: number
  triangleLimit: number
}

export class RuntimeGuard {
  private options: GuardOptions
  private prevGeometries = 0
  private leakFrames = 0
  private isDisposed = false

  constructor(
    private renderer: RendererInfo,
    options?: Partial<GuardOptions>
  ) {
    this.options = {
      drawCallLimit: options?.drawCallLimit ?? 100,
      triangleLimit: options?.triangleLimit ?? 500_000,
    }
  }

  check(): void {
    if (this.isDisposed) return
    const { render, memory } = this.renderer.info

    if (render.calls > this.options.drawCallLimit)
      console.warn(`[Budget] Draw calls: ${render.calls}/${this.options.drawCallLimit}`)

    if (render.triangles > this.options.triangleLimit)
      console.warn(`[Budget] Triangles: ${render.triangles}/${this.options.triangleLimit}`)

    if (memory.geometries > this.prevGeometries) {
      this.leakFrames++
      if (this.leakFrames >= 3)
        console.warn(`[Budget] Geometry leak? Count rising: ${memory.geometries} (${this.leakFrames} frames)`)
    } else {
      this.leakFrames = 0
    }

    this.prevGeometries = memory.geometries
  }

  dispose(): void {
    if (this.isDisposed) return
    this.isDisposed = true
  }
}
