# Roadmap — Khu phố 3D (v2.0)

> Cập nhật theo **PIPELINE TỔNG KẾT v2.0 (8/5/2026)**.
> Pipeline 4 stages: AI Gen → Blender MCP Refine → Three.js Shaders → Web Delivery

---

## 🟢 Tuần 1 (Đang ở đây)

- [x] Architecture document đã có
- [x] Đánh giá thị trường AI 3D 2026
- [x] Pipeline 4 stages locked
- [x] Build 4 skills MVP 
- [x] Code GlobalUniforms (Build Order #1)
- [ ] Setup Claude Desktop + Blender MCP

---

## 🟡 Tuần 2-3: Thử nghiệm Workflow & Phase A (Part 1)

- [ ] Trial 3D AI Studio ($29 first month)
- [ ] Test workflow: Tripo → Blender MCP → Three.js
- [ ] Code TriplanarMapping (Build Order #2)
- [ ] Apply TriplanarMapping lên 1 mesh từ Tripo
- [ ] Visual shader preview qua Blender MCP

---

## 🟠 Tuần 4-6: Hoàn thành Phase A (Environment Foundation)

- [ ] Code WorldNoise (Build Order #3)
- [ ] Code RoundedCorners (Build Order #4)
- [ ] **Phase A complete**
- [ ] Demo asset đầu tiên: AI gen → MCP refine → Phase A shader → Three.js

---

## 🔵 Tuần 7-10: Phase B (Advanced Environment & Splats)

- [ ] Phase B: LODSystem (Build Order #6), ProceduralFracture (#5), InteriorMapping (#7)
- [ ] Spark.js integration (Build Order #8)
- [ ] Test Splat từ Luma AI kết hợp Phase A shaders

---

## 🟣 Tuần 11-14: Phase C (Character Pipeline)

- [ ] Auto-rig character qua Blender MCP
- [ ] Code VATShader (Build Order #9)
- [ ] Test VATShader với character
- [ ] LODBillboard (#10) & CharacterPool (#11) cho crowd

---

## 🔴 Tuần 15-16: Phase D (Polish & Deploy)

- [ ] Code PostProcessing (Build Order #13): Volumetric fog, Bloom, Tonemapping
- [ ] WindAnimation (#14) & DayNightCycle (#15)
- [ ] Đạt chuẩn Performance Budget (< 100 draw calls, < 500k tris, < 16.6ms)
- [ ] Deploy live demo lên Vercel

