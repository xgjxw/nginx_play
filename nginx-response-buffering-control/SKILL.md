---
name: nginx-response-buffering-control
description: 控制nginx对后端响应（FastCGI或代理）的缓冲行为，决定响应是全量缓冲后再发送给客户端，还是以流式方式实时转发。当需要优化性能、控制内存/磁盘使用，或处理大响应体时使用此技能。
---

# Nginx 响应缓冲控制

## 何时使用
- 配置 FastCGI 或 HTTP 代理时需调整响应缓冲策略
- 需要平衡内存消耗与客户端响应延迟
- 后端服务返回大体积响应（如文件下载、API 批量数据）
- 需通过 `X-Accel-Buffering` 响应头动态控制缓冲行为

## 核心操作步骤

### 1. 启用或禁用缓冲
- **FastCGI 场景**：设置 `fastcgi_buffering on|off;`
- **代理场景**：设置 `proxy_buffering on|off;`
- 默认值均为 `on`（启用缓冲）

### 2. 配置缓冲区参数（仅在启用缓冲时生效）
- **首部缓冲区**：
  - FastCGI：`fastcgi_buffer_size`
  - 代理：`proxy_buffer_size`
- **主体缓冲区**：
  - FastCGI：`fastcgi_buffers`
  - 代理：`proxy_buffers`

### 3. 处理溢出到磁盘的情况（仅启用缓冲时）
- 设置最大临时文件大小：
  - FastCGI：`fastcgi_max_temp_file_size`
  - 代理：`proxy_max_temp_file_size`
- 设置单次写入磁盘大小：
  - FastCGI：`fastcgi_temp_file_write_size`
  - 代理：`proxy_temp_file_write_size`

### 4. 动态覆盖缓冲行为
- 后端可在响应头中添加 `X-Accel-Buffering: yes|no` 以动态启用/禁用缓冲
- 若需忽略该头，使用：
  - FastCGI：`fastcgi_ignore_headers X-Accel-Buffering;`
  - 代理：`proxy_ignore_headers X-Accel-Buffering;`

### 5. 禁用缓冲时的行为
- 响应在接收时立即同步转发给客户端
- nginx 不尝试读取完整响应
- 单次接收数据量受 `*_buffer_size` 限制

> 注意：`fastcgi_limit_rate` 仅在 FastCGI 缓冲启用时生效。