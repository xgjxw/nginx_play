---
name: nginx-grpc-proxy-and-retry-configuration
description: 配置 Nginx 的 ngx_http_grpc_module 模块以代理 gRPC over HTTP/2 请求，并设置连接超时、错误重试及 SSL/TLS 安全通信。当配置中包含 grpc_pass 指令，且需将 HTTP/2 客户端请求转发至 gRPC 服务器时使用此技能。
---

# Nginx gRPC 代理与错误重试配置

## 适用场景
- 使用 Nginx 作为 gRPC 服务的反向代理
- 后端为 gRPC 服务器，前端通过 HTTP/2 发起请求
- 需要配置连接超时、错误自动重试或启用 SSL/TLS 加密（grpcs）

## 前提条件
- 已启用 `ngx_http_v2_module` 模块
- server 块中配置了 `listen ... http2;`
- 提供有效的 `grpc_pass` 地址（支持 IP:port、UNIX 套接字或 grpcs://）

## 核心配置步骤

### 1. 基础代理设置
在 `location` 块中：
```nginx
grpc_pass address;
```
- 支持格式：`127.0.0.1:9000`、`unix:/tmp/grpc.socket`、`grpc://host:port` 或 `grpcs://host:port`
- 多地址域名解析时自动轮询

### 2. 超时控制
```nginx
grpc_connect_timeout 60s;  # 连接建立超时
grpc_send_timeout 60s;     # 写操作间隔超时
grpc_read_timeout 60s;     # 读操作间隔超时
```
- 建议 `grpc_connect_timeout` 不超过 75 秒

### 3. 错误重试机制（grpc_next_upstream）
```nginx
grpc_next_upstream error timeout http_500 http_502 http_503 http_504;
grpc_next_upstream_tries 3;
grcp_next_upstream_timeout 10s;
```
- 默认重试条件：`error timeout`
- 可选条件：`invalid_header`, `http_500`, `http_502`, `http_503`, `http_504`, `http_429`, `non_idempotent`
- **关键规则**：
  - `error`/`timeout`/`invalid_header` 始终触发重试
  - `http_403`/`http_404` **永不**触发重试
  - 仅在未向客户端发送任何响应前才允许重试
  - `non_idempotent` 允许重试非幂等请求（如 POST）

### 4. SSL/TLS 配置（用于 grpcs）
```nginx
grpc_ssl_verify on;
grcp_ssl_certificate /path/to/client.crt;
grcp_ssl_certificate_key /path/to/client.key;
grcp_ssl_trusted_certificate /path/to/ca.pem;
```
- 其他可选指令：`grpc_ssl_protocols`, `grpc_ssl_ciphers`, `grpc_ssl_session_reuse`, `grpc_ssl_server_name`

### 5. 其他常用指令
- `grpc_set_header`: 设置或清除请求头
- `grpc_hide_header` / `grpc_pass_header`: 控制响应头透传
- `grpc_intercept_errors`: 拦截 ≥300 响应以使用 `error_page`
- `grpc_socket_keepalive`: 启用 TCP keepalive（Nginx 1.15.6+）

> 注意：所有 gRPC 代理功能仅适用于 gRPC over HTTP/2，不支持普通 HTTP/1.1。