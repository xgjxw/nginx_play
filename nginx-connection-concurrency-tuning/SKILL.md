---
name: nginx-connection-concurrency-tuning
description: 配置 nginx 的连接并发能力，包括 worker_processes、worker_connections 和 accept_mutex 设置，以优化高并发场景下的性能。当需要调整 nginx 实例的最大并发连接数或解决“惊群问题”时使用此技能。
---

# Nginx 连接与并发调优

## 何时使用
- 需要提升 nginx 的最大并发处理能力
- 观察到工作进程资源浪费或连接接受不均衡
- 系统运行在不支持 EPOLLEXCLUSIVE 或未启用 reuseport 的环境中

## 核心配置步骤

### 1. 设置工作进程数量（worker_processes）
- 推荐设为 CPU 核心数，或使用 `auto` 自动检测（nginx 1.3.8+/1.2.5+）
- 示例：`worker_processes auto;`

### 2. 设置每个进程的连接数（worker_connections）
- 定义每个工作进程可处理的最大并发连接数（含客户端和后端连接）
- 默认值为 512，通常需根据负载调高
- 示例：`events { worker_connections 2048; }`

### 3. 决定是否启用 accept_mutex
- **启用条件**：系统不支持 `EPOLLEXCLUSIVE`（Linux < 4.5 或 nginx < 1.11.3）且未配置 `reuseport`
- 若满足上述条件，设置 `accept_mutex on;` 可避免“惊群问题”
- nginx 1.11.3+ 默认为 `off`，在现代系统中通常无需显式开启

### 4. 验证系统限制
- 确保 `worker_processes × worker_connections` 不超过单进程文件描述符限制
- 必要时通过 `worker_rlimit_nofile` 提升限制，避免连接被拒绝

> 注意：若系统支持 `EPOLLEXCLUSIVE` 或已使用 `listen ... reuseport`，则无需启用 `accept_mutex`。