import './style.css'
import { World } from '@/world/World'

/**
 * 🚀 Entry Point: Điểm bắt đầu của ứng dụng.
 * Nhiệm vụ duy nhất là khởi tạo thế giới 3D.
 */

// Đợi DOM sẵn sàng rồi mới chạy
window.addEventListener('DOMContentLoaded', () => {
  // Tạo một thế giới mới (World sẽ tự tìm canvas hoặc tạo trong body)
  // Lưu ý: BaseWorld của chúng ta mặc định dùng document.body nếu không tìm thấy ID
  new World('app')
  
  console.log('🚀 Khu phố 3D đã khởi động thành công!')
})
