---
name: nginx-scgi-response-buffering-control
description: 控制Nginx SCGI响应的缓冲行为（启用/禁用缓冲、内存与磁盘缓冲配置、动态覆盖机制）。当需要优化SCGI后端响应传输方式（如选择流式传输或完整缓冲）以提升性能或降低延迟时使用。
---

# Nginx SCGI 响应缓冲控制

## 触发场景
- 需要决定SCGI响应是实时流式传输还是先缓冲再发送
- 遇到大响应导致内存压力或客户端等待时间过长
- 需通过响应头动态控制缓冲行为

## 核心操作步骤

### 1. 启用或禁用缓冲
在 `location` 或 `server` 上下文中设置：
```nginx
scgi_buffering on | off;  # 默认为 on
```
- **on**：Nginx 尽快从 SCGI 后端读取完整响应，存入内存缓冲区后再发送给客户端
- **off**：响应数据实时同步传递给客户端，不尝试读取完整响应

### 2. 配置内存缓冲区
```nginx
scgi_buffer_size size;        # 首部缓冲区大小，默认 4K/8K
scgi_buffers number size;     # 缓冲区数量和单个大小，默认 8 个 4K/8K
```

### 3. 配置磁盘溢出（仅当 `scgi_buffering on` 且内存不足时生效）
```nginx
scgi_max_temp_file_size size;      # 临时文件最大大小，默认 1024m；设为 0 禁用磁盘缓冲
scgi_temp_file_write_size size;    # 单次写入临时文件的数据量，默认 8k/16k
```

### 4. 设置忙缓冲区限制
```nginx
scgi_busy_buffers_size size;  # 默认等于两个缓冲区大小
```
限制在响应未完全读取时可用于向客户端发送的缓冲区总量。

### 5. 动态控制缓冲行为
SCGI 后端可通过响应头覆盖配置：
```
X-Accel-Buffering: yes|no
```
但该行为可被 `scgi_ignore_headers X-Accel-Buffering;` 禁用。

## 注意事项
- 禁用缓冲 (`scgi_buffering off`) 时无法使用磁盘临时文件
- 所有缓冲相关指令需在已配置 `scgi_pass` 的上下文中使用
- 缓冲配置影响内存使用、响应延迟和后端负载，需根据业务场景权衡