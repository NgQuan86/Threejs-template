# Roadmap — Khu phố 3D

Theo dõi tiến độ toàn dự án. Chi tiết kỹ thuật từng mục nằm trong README của thư mục tương ứng.

---

## 🟢 Giai đoạn 1: Nền tảng Developer — HOÀN THÀNH

- [x] Debug UI (Tweakpane) — chỉnh thông số trực tiếp trên browser
- [x] Stats.js — theo dõi FPS / MS / Memory
- [x] BaseWorld lifecycle — Resize, Dispose, animation loop chuẩn
- [x] RuntimeGuard — cảnh báo vượt draw call / triangle budget
- [x] Commit gate — Husky + lint-staged + tsc + ESLint + Prettier

---

## 🟡 Giai đoạn 2: Tài nguyên & Môi trường — GẦN XONG

- [x] ResourceLoader — load GLTF (+ Draco), Texture, HDR với cache
- [x] LoadingScreen — progress bar khi tải asset
- [x] OrbitControls — xoay/zoom camera
- [x] Bộ utils đầy đủ — ViewportLinker, InteractionHelper, InstancedMeshPool, PostProcessingManager
- [ ] **Environment Setup** — ánh sáng HDR cho scene (`PMREMGenerator` + `scene.environment`)

---

## 🟠 Giai đoạn 3: Vật liệu, Tương tác & Hậu kỳ

- [ ] **Shader Library** — Water, Glass/Fresnel, Distance Fog, Glow (xem `src/shaders/`)
- [ ] **Animation System** — `THREE.AnimationMixer` cho GLTF clip + GSAP cho camera tween
- [ ] **Scene Router** — quản lý chuyển đổi giữa nhiều scene với dispose đúng chuẩn
- [ ] **Camera System** — nhiều chế độ: overview / follow / first-person / cinematic
- [ ] **Post-processing** — Bloom, Color Grading, FXAA (PostProcessingManager đã sẵn sàng)
- [ ] **UI Components** — InfoPanel, MiniMap, TimeOfDay slider (xem `src/components/`)

---

## 🔴 Giai đoạn 4: Tối ưu hóa & Công nghệ mới

- [ ] **WebGPU / TSL Migration** — chuyển shader sang TSL cho WebGPU
- [ ] **KTX2 Texture Compression** — load texture thẳng lên GPU (xem `src/utils/README.md`)
- [ ] **LOD System** — giảm chi tiết vật thể ở xa tự động
- [ ] **Audio System** — `THREE.PositionalAudio` gắn với object trong scene

---

> Khi hoàn thành một mục → đổi `[ ]` thành `[x]`.
> Chi tiết triển khai và backlog kỹ thuật → xem README trong từng thư mục `src/`.
