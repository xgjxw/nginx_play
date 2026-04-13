---
name: Nginx Gzip 压缩与静态文件处理
description: 配置 Nginx 的 gzip 动态压缩、gunzip 自动解压和 gzip_static 静态预压缩功能，以优化 HTTP 响应传输效率。当需要启用或调试 Nginx 中与 gzip 相关的压缩、解压或静态 .gz 文件服务时使用此技能。
---

# Nginx Gzip 压缩与静态文件处理

## 何时使用
- 启用 `gzip`、`gunzip` 或 `gzip_static` 指令时
- 需要根据客户端 `Accept-Encoding` 头动态压缩响应内容
- 需要为不支持 gzip 的客户端自动解压后端返回的 gzip 内容
- 已预压缩静态资源（如 `.js.gz`、`.css.gz`），希望 Nginx 直接提供

## 核心操作流程

### 1. 启用动态压缩（ngx_http_gzip_module）
- 设置 `gzip on;`
- 确保满足以下压缩条件：
  - 响应 MIME 类型在 `gzip_types` 中（默认仅 `text/html`；使用 `*` 匹配所有）
  - 响应体大小 ≥ `gzip_min_length`（默认 20 字节，基于 `Content-Length`）
  - 客户端 User-Agent 未被 `gzip_disable` 排除（如 `msie6`）
  - 若为代理请求，需满足 `gzip_proxied` 条件（如 `expired`、`no-cache`、`auth` 等）
  - HTTP 版本 ≥ `gzip_http_version`（默认 1.1）
- 调整压缩参数：
  - `gzip_comp_level 1-9`（默认 1，平衡 CPU 与压缩率）
  - `gzip_buffers`（默认 32 4k 或 16 8k）
- 添加响应头：
  - 若启用 `gzip_vary on;`，则添加 `Vary: Accept-Encoding`
  - 可通过 `$gzip_ratio` 记录压缩比

### 2. 启用自动解压（ngx_http_gunzip_module）
- 编译时需包含 `--with-http_gunzip_module`
- 设置 `gunzip on;`，对不支持 gzip 的客户端自动解压后端返回的 `Content-Encoding: gzip` 响应
- 解压行为受 `gzip_http_version`、`gzip_proxied` 和 `gzip_disable` 影响
- 使用 `gunzip_buffers` 设置解压缓冲区大小

### 3. 启用静态预压缩文件服务（ngx_http_gzip_static_module）
- 编译时需包含 `--with-http_gzip_static_module`
- 设置 `gzip_static on;`：检查是否存在同名 `.gz` 文件并优先提供（需客户端支持 gzip）
- 设置 `gzip_static always;`（Nginx 1.3.6+）：始终使用 `.gz` 文件，无视客户端是否支持 gzip
- 此功能仍受 `gzip_http_version`、`gzip_proxied`、`gzip_disable` 和 `gzip_vary` 影响
- **最佳实践**：确保原始文件与 `.gz` 文件的修改时间一致，避免缓存不一致

### 4. 安全注意事项
- **禁止在 SSL/TLS 协议下启用 gzip 压缩**，以防遭受 CRIME 等侧信道攻击
- 除非使用 `gunzip` 或 `gzip_static always`，否则必须确认客户端支持 gzip
- 正确配置 MIME 类型和最小响应长度，避免无效压缩

> 提示：使用 `curl -H "Accept-Encoding: gzip" -I <URL>` 测试压缩行为。