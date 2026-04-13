---
name: nginx-index-and-rate-limiting
description: 配置 Nginx 的索引文件处理（index 指令）以及连接数和请求速率限制（limit_conn / limit_req）。当需要为目录请求自动返回默认文件，或对客户端实施并发连接/请求频率限制以防止资源滥用或 DDoS 攻击时使用此技能。
---

# Nginx 索引文件与限流配置

## 何时使用
- 请求 URI 以 `/` 结尾，需自动返回如 index.html 的默认文件
- 需限制单个客户端 IP 的并发连接数（如防连接耗尽）
- 需限制单个客户端 IP 的请求速率（如防爬虫或暴力请求）
- 已通过 `limit_conn_zone` 或 `limit_req_zone` 定义共享内存区域

## 如何执行

### 1. 索引文件处理（ngx_http_index_module）
- 使用 `index file1 file2 ...;` 定义索引文件列表（默认 `index.html`）
- 文件名可包含变量（如 `index.$geo.html`）或绝对路径（如 `/index.html`）
- Nginx 按顺序检查文件是否存在，首个存在的文件触发内部重定向
- 内部重定向后，请求 URI 变更为 `/匹配文件名`，并可能由其他 location 块处理

### 2. 连接数限制（ngx_http_limit_conn_module）
- 先定义共享内存区：`limit_conn_zone $binary_remote_addr zone=name:size;`
- 在 location 中应用限制：`limit_conn name number;`
- 超限时返回 503（可通过 `limit_conn_status` 修改）
- 使用 `$binary_remote_addr` 而非 `$remote_addr` 以节省内存

### 3. 请求速率限制（ngx_http_limit_req_module）
- 定义速率区域：`limit_req_zone $binary_remote_addr zone=name:size rate=rate;`
- 应用限制：`limit_req zone=name [burst=N] [nodelay] [delay=N];`
- 使用“漏桶”算法：突发请求被延迟，超出 burst 则拒绝
- 日志级别由 `limit_req_log_level` 控制

### 通用规则
- 配置指令仅在当前层级未定义时继承上级
- HTTP/2 中每个流视为独立连接
- 仅统计已完整读取请求头的连接
- 不适用于非目录请求（索引功能）