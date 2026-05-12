# src/shaders/

Chứa các shader module được tích hợp từ `threejs-modules/shaders/`.

> Thêm shader mới → thêm 1 dòng vào bảng bên dưới.

---

## Danh sách

| Folder      | Vai trò | Deps | Status |
| ----------- | ------- | ---- | ------ |
| _(chưa có)_ | —       | —    | —      |

---

## Quy tắc

1. Mỗi shader = 1 folder con, copy nguyên từ `threejs-modules/shaders/[tên]/`
2. Không sửa file đã copy — giữ nguyên để diff với source
3. Mọi shader phải dùng `GlobalUniforms.inject(material)` nếu cần uTime/uWeather/uDamage
4. Shader file `.glsl` / `.wgsl` đặt trong cùng folder, import bằng `?raw`
