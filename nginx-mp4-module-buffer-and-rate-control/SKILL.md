---
name: nginx-mp4-module-buffer-and-rate-control
description: 配置和管理 Nginx ngx_http_mp4_module 模块中的缓冲区大小与传输速率限制。当在 location 块中启用了 mp4 指令，并且客户端请求包含 start 或 end 参数（用于 MP4 伪流）时，使用本技能调整缓冲区分配与带宽控制策略，确保服务稳定性并防止资源耗尽。
---

# Nginx MP4 模块缓冲区与速率限制配置

## 何时使用
- 在 Nginx 的 `location` 块中已配置 `mp4;` 指令
- 客户端发起的 MP4 伪流请求包含 `start` 或 `end` 查询参数
- 需要控制内存使用（通过缓冲区设置）或限制视频传输带宽（商业版功能）

## 如何执行

### 1. 设置缓冲区参数
- 使用 `mp4_buffer_size size;` 设置初始缓冲区大小（默认 512K），可在 http、server 或 location 上下文中配置。
- 使用 `mp4_max_buffer_size size;` 设置元数据处理期间允许的最大缓冲区大小（默认 10M）。若 moov atom 超过此值，Nginx 返回 500 错误。

### 2. 启用速率限制（仅限 Nginx 商业订阅版本）
- 配置 `mp4_limit_rate on|off|factor;`：
  - `off`（默认）：禁用限速
  - `on`：等效于 `factor=1.1`，按平均比特率 × 1.1 限速
  - 数值（如 `1.5`）：按比特率 × factor 计算限速值
- 配置 `mp4_limit_rate_after time;`（默认 60s）：指定前多少秒全速传输，之后启用限速（例如 `30s` 表示前 30 秒不限速）。

### 3. 执行逻辑
- 当请求触发 MP4 处理流程时，Nginx 使用 `mp4_buffer_size` 分配初始缓冲区。
- 若元数据过大，缓冲区动态扩展，但不超过 `mp4_max_buffer_size`。
- 若启用了 `mp4_limit_rate` 且已超过 `mp4_limit_rate_after` 设定的时间，则对后续数据应用计算出的速率限制。

> 注意：`mp4_limit_rate` 和 `mp4_limit_rate_after` 仅在 Nginx 商业订阅版本中可用。开源版本忽略这些指令。