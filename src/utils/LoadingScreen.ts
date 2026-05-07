/**
 * LoadingScreen — Màn hình chờ khi tải tài nguyên 3D
 *
 * VỊ TRÍ TRONG DỰ ÁN:
 *   src/utils/LoadingScreen.ts
 *   Được import trực tiếp vào World.ts — không qua BaseWorld.
 *
 * VAI TRÒ:
 *   Hiển thị overlay toàn màn hình với progress bar trong khi
 *   ResourceLoader đang tải file. Fade out khi tải xong 100%.
 *
 * MỐI LIÊN HỆ:
 *   LoadingScreen KHÔNG import ResourceLoader.
 *   Chỉ nhận dữ liệu qua onProgress callback — hoàn toàn tách biệt.
 *
 *   ┌─────────────┐                         ┌──────────────┐
 *   │ LoadingScreen│  ←── onProgress() ───── │ResourceLoader│
 *   └─────────────┘                          └──────────────┘
 *          ↑                                        ↑
 *          └──────────── World.ts kết nối ──────────┘
 *
 * CÁCH DÙNG TRONG World.ts:
 *   const screen = new LoadingScreen()
 *   const loader = new ResourceLoader(screen.onProgress.bind(screen))
 *   // ... load assets ...
 *   await screen.hide()   ← fade out 0.6s, tự dispose sau khi xong
 *
 * KHI NÀO CẦN:
 *   Optional — chỉ dùng khi có ResourceLoader.
 *   Không có LoadingScreen, app vẫn chạy nhưng user thấy màn hình trắng
 *   trong lúc chờ asset tải xong.
 *
 * THAY ĐỔI STYLE:
 *   Toàn bộ giao diện nằm trong build() — chỉnh màu, kích thước tại đây.
 *   Không dùng file CSS riêng để class tự chứa hoàn toàn.
 *
 * DISPOSE:
 *   hide() tự gọi dispose() sau khi fade out xong.
 *   Không cần gọi dispose() thủ công nếu đã dùng hide().
 */

export class LoadingScreen {
  private overlay: HTMLElement
  private fill: HTMLElement
  private percent: HTMLElement
  private isDisposed = false

  constructor() {
    const { overlay, fill, percent } = this.build()
    this.overlay = overlay
    this.fill = fill
    this.percent = percent
    document.body.appendChild(this.overlay)
  }

  onProgress(_url: string, loaded: number, total: number): void {
    const pct = total > 0 ? Math.round((loaded / total) * 100) : 0
    this.fill.style.width = `${pct}%`
    this.percent.textContent = `${pct}%`
  }

  hide(): Promise<void> {
    return new Promise((resolve) => {
      this.overlay.style.opacity = '0'
      setTimeout(() => {
        this.dispose()
        resolve()
      }, 600)
    })
  }

  dispose(): void {
    if (this.isDisposed) return
    this.overlay.remove()
    this.isDisposed = true
  }

  private build(): { overlay: HTMLElement; fill: HTMLElement; percent: HTMLElement } {
    const overlay = document.createElement('div')
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '9999',
      transition: 'opacity 0.6s ease',
    })

    const track = document.createElement('div')
    Object.assign(track.style, {
      width: '280px',
      height: '2px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '2px',
      overflow: 'hidden',
      marginBottom: '16px',
    })

    const fill = document.createElement('div')
    Object.assign(fill.style, {
      height: '100%',
      width: '0%',
      background: 'rgba(255,255,255,0.9)',
      transition: 'width 0.3s ease',
      borderRadius: '2px',
    })
    track.appendChild(fill)

    const percent = document.createElement('div')
    Object.assign(percent.style, {
      color: 'rgba(255,255,255,0.4)',
      fontSize: '11px',
      letterSpacing: '0.15em',
      fontFamily: 'system-ui, sans-serif',
      fontWeight: '300',
    })
    percent.textContent = '0%'

    overlay.appendChild(track)
    overlay.appendChild(percent)

    return { overlay, fill, percent }
  }
}
