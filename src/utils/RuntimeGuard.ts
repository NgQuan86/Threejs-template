/**
 * RuntimeGuard — Cảnh báo hiệu năng theo từng frame
 *
 * VỊ TRÍ TRONG DỰ ÁN:
 *   src/utils/RuntimeGuard.ts
 *   Được BaseWorld tự khởi tạo — không cần import thủ công trong World.ts.
 *
 * VAI TRÒ:
 *   Đọc thống kê renderer sau mỗi frame và cảnh báo console nếu vượt budget:
 *   - Draw calls > 100
 *   - Triangle count > 500,000
 *   - Geometry count tăng liên tiếp 3 frame (dấu hiệu memory leak)
 *
 * MỐI LIÊN HỆ:
 *   BaseWorld tạo và gọi RuntimeGuard — World.ts không cần biết
 *
 *   BaseWorld.setupDevTools()  →  new RuntimeGuard(renderer)
 *   BaseWorld.startLoop()      →  devGuard.check()  ← gọi sau mỗi render()
 *
 * TẠI SAO PHẢI GỌI SAU render() KHÔNG PHẢI setInterval:
 *   renderer.info.render (calls, triangles) tự reset về 0 sau mỗi lần
 *   renderer.render() được gọi. Nếu dùng setInterval sẽ luôn đọc được 0.
 *   Phải đọc ngay sau render() trong cùng frame mới có số thật.
 *
 * DEV-ONLY:
 *   Chỉ chạy khi import.meta.env.DEV = true (npm run dev).
 *   Bị tree-shaken hoàn toàn khi npm run build — không có trong production.
 *
 * THAY ĐỔI BUDGET:
 *   new RuntimeGuard(renderer, { drawCallLimit: 50, triangleLimit: 200_000 })
 *
 * DISPOSE:
 *   Tự động được BaseWorld.dispose() gọi — không cần làm thủ công.
 */

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
        console.warn(
          `[Budget] Geometry leak? Count rising: ${memory.geometries} (${this.leakFrames} frames)`
        )
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
