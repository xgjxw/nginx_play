---
name: nginx-image-filter-configuration
description: 在 Nginx 的 HTTP location 配置块中配置 image_filter 指令，用于对图像资源执行验证、元数据提取、旋转、缩放或裁剪等处理操作。当请求路径匹配已配置 image_filter 的 location 且响应内容为图像（JPEG/GIF/PNG/WebP）时使用本技能。
---

# Nginx 图像处理指令配置

## 适用场景
- 请求资源为图像文件（JPEG/GIF/PNG/WebP）
- Nginx 已启用 image_filter 模块
- 配置位于 `location` 上下文中

## 核心操作配置

### 关闭或测试模式
- `image_filter off;`：禁用图像处理
- `image_filter test;`：验证响应是否为支持的图像格式，否则返回 HTTP 415 错误

### 获取图像元数据
- `image_filter size;`：返回 JSON 格式的图像尺寸与类型（如 `{"img":{"width":100,"height":100,"type":"gif"}}`），失败时返回 `{}`

### 图像变换操作
- **旋转**：`image_filter rotate 90|180|270;`（逆时针），支持变量参数
- **缩放**：`image_filter resize width height;`，任一维度设为 `-` 表示按比例仅调整另一维度
- **裁剪**：`image_filter crop width height;`，先按比例缩放到较大边，再裁剪多余部分；任一维度设为 `-` 表示仅裁剪另一维度

## 组合操作顺序规则
- `resize` 和 `rotate` 组合：先执行 `resize`，再执行 `rotate`
- `rotate` 和 `crop` 组合：先执行 `rotate`，再执行 `crop`
- 所有 `width`/`height` 参数支持 Nginx 变量
- 所有缩放和裁剪操作均保持图像比例，防止变形

## 错误处理
- 非图像响应在 `test`、`resize` 或 `crop` 模式下返回 HTTP 415
- 元数据获取失败时返回空 JSON `{}`

> 注意：所有图像处理指令仅在 `location` 块中有效。