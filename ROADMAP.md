# Dự án Three.js/WebGPU Roadmap 🚀

Lộ trình phát triển được thiết kế để xây dựng dự án từ cốt lõi chuyên nghiệp đến các tính năng đồ họa cao cấp, ưu tiên tính ổn định và trải nghiệm lập trình viên.

---

## 🟢 Giai đoạn 1: Trải nghiệm Lập trình viên (Thiết yếu nhất)
*Mục tiêu: Giúp việc code và tinh chỉnh 3D trở nên nhanh chóng, trực quan.*

- [ ] **Tích hợp Debug UI (Tweakpane/Leva)**: Cho phép thay đổi thông số đèn, vật liệu, vị trí vật thể ngay trên trình duyệt mà không cần reload trang.
- [ ] **Hệ thống Monitor**: Kích hoạt `Stats.js` để theo dõi FPS, MS và Memory.
- [ ] **Hoàn thiện Lifecycle**: Đảm bảo `BaseWorld` xử lý tốt việc Resize, Fullscreen và Dispose (giải phóng bộ nhớ) để tránh memory leak.

---

## 🟡 Giai đoạn 2: Hệ thống Tài nguyên & Môi trường
*Mục tiêu: Đưa nội dung thực tế (Models, Textures) vào dự án một cách chuyên nghiệp.*

- [ ] **Resource Loader**: Xây dựng Class quản lý việc load GLTF, Texture, HDR tập trung. Có hỗ trợ Progress Bar.
- [ ] **Environment Setup**: Tích hợp ánh sáng môi trường (HDR) để tạo độ chân thực (Realism) cơ bản cho mọi vật thể.
- [ ] **Camera Controls**: Tích hợp OrbitControls hoặc một hệ thống camera chuyên dụng.

---

## 🟠 Giai đoạn 3: Hệ thống Vật liệu & Hậu kỳ
*Mục tiêu: Tạo ra hình ảnh "Wow" và định hình phong cách nghệ thuật.*

- [ ] **Shader Library**: Xây dựng các shader cụ thể dựa trên `BaseShader` (ví dụ: Ocean, Glow, Distant Fog).
- [ ] **Post-processing Pipeline**: Thiết lập Bloom, Color Grading, và Anti-aliasing cao cấp.
- [ ] **Interaction System**: Xây dựng hệ thống Raycaster để tương tác (Click/Hover) với các vật thể trong scene.

---

## 🔴 Giai đoạn 4: Tối ưu hóa & Công nghệ mới
*Mục tiêu: Sẵn sàng cho tương lai và chạy mượt trên mọi thiết bị.*

- [ ] **WebGPU/TSL Migration**: Chuyển đổi dần các Shader sang `TSL` (Three Shading Language) để tận dụng tối đa GPU thế hệ mới.
- [ ] **Performance Profiling**: Kiểm tra draw calls, triangle count và tối ưu hóa kết cấu (Texture Compression).
- [ ] **LOD (Level of Detail)**: Tự động giảm chi tiết vật thể ở xa để tăng hiệu suất.

---

> [!NOTE]
> Roadmap này là một thực thể sống. Khi Antigravity hoặc Claude Code hoàn thành một nhiệm vụ, chúng tôi sẽ cập nhật dấu `[x]` vào đây.
