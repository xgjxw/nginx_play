---
name: nginx-server-names-hash-tuning
description: 当 Nginx 启动时报告 'could not build the server_names_hash' 错误时，使用本技能调整 server_names_hash_max_size 和 server_names_hash_bucket_size 参数以解决哈希表构建失败问题。适用于在 http 配置块中定义了大量或超长 server_name 的场景。
---

# Nginx Server Names 哈希参数调优

## 何时使用
当 Nginx 启动日志中出现以下任一错误时立即应用：
- `could not build the server_names_hash, you should increase server_names_hash_bucket_size: 32`
- `could not build the server_names_hash, you should increase either server_names_hash_max_size: 512 or server_names_hash_bucket_size: 32`

## 执行步骤

### 步骤 1：识别错误类型
- **仅提示增加 bucket_size** → 单个 `server_name` 过长。
- **提示增加 max_size 或 bucket_size** → `server_name` 数量过多。

### 步骤 2：针对性调优
- **针对过长的 server_name**：
  - 将 `server_names_hash_bucket_size` 调整为大于最长名称长度的最小 2 的幂（如 64、128）。
  - 示例：`http { server_names_hash_bucket_size 64; }`

- **针对过多的 server_name**：
  - 首先将 `server_names_hash_max_size` 设置为略大于实际 `server_name` 总数的值。
  - 若仍失败或启动缓慢，再适度增加 `server_names_hash_bucket_size`。

### 步骤 3：验证配置
- 确保两个指令仅在 `http` 块中设置，不可置于 `server` 或 `location` 块。
- 重启 Nginx 并检查是否仍有错误。

> 注意：过度增大参数会增加内存占用和启动时间，应按需调整。