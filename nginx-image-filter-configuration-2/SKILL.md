---
name: nginx-image-filter-configuration-2
description: 配置 Nginx 的 image_filter 模块相关参数，用于控制输出图像的质量、格式特性及文件大小。当已在 HTTP、server 或 location 块中启用 image_filter 指令，并需要调整 JPEG/WebP 质量、锐化、透明度或隔行扫描等图像处理行为时使用本技能。
---

# Nginx 图像处理辅助指令配置

在已启用 `image_filter` 指令的前提下，通过以下步骤配置图像处理参数：

1. **设置图像读取缓冲区上限**：使用 `image_filter_buffer size`（默认 1M），超出则返回 415 错误。
2. **启用隔行扫描输出**：在 Nginx ≥1.3.15 时，使用 `image_filter_interlace on` 生成渐进式 JPEG。
3. **调整 JPEG 质量**：通过 `image_filter_jpeg_quality quality`（范围 1–100，默认 75），建议不超过 95；支持变量。
4. **增强图像清晰度**：使用 `image_filter_sharpen percent`，0 表示关闭，可超过 100%；支持变量。
5. **控制透明度保留**：用 `image_filter_transparency on|off` 决定 GIF/PNG 调色板转换时是否保留透明度（PNG Alpha 始终保留）。
6. **设置 WebP 质量**：在 Nginx ≥1.11.6 时，使用 `image_filter_webp_quality quality`（范围 1–100，默认 80）；支持变量。

> 所有质量与锐化参数均可包含变量，适用于动态调整场景。

## 使用前提
- 已在配置块中启用 `image_filter` 指令。
- 注意指令的 Nginx 版本要求（如 `interlace` 需 ≥1.3.15，`webp_quality` 需 ≥1.11.6）。

## 适用配置块
- `http` 块
- `server` 块
- `location` 块