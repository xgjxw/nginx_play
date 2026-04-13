---
name: nginx-proxy-cache-path-configuration
description: 配置 Nginx 代理缓存的物理存储结构与后台管理进程，包括文件系统层级、共享内存区域、过期清理策略及加载行为。当需要在 http 上下文中设置 proxy_cache_path 指令以优化缓存性能和资源管理时使用本技能。
---

# Nginx 代理缓存路径配置

## 使用前提
- 仅可在 `http` 上下文中配置。
- 商业订阅功能（如 purger）需额外许可。

## 核心配置步骤

### 1. 基础语法
```nginx
proxy_cache_path path [levels=1:2] keys_zone=name:size [inactive=time] [use_temp_path=on|off] ...;
```

### 2. 文件系统缓存结构
- 缓存文件名由 `MD5(cache_key)` 生成。
- 使用 `levels` 定义目录层级（1–3 级，每级 1 或 2 位十六进制字符），例如 `levels=1:2` 生成路径如 `/c/29/b7f54...`。
- 响应先写入临时文件，再重命名为最终缓存文件。
- 自 Nginx 0.8.9 起，临时文件与缓存目录可跨文件系统，但会触发复制而非原子重命名；建议置于同一文件系统。
- `use_temp_path`（1.7.10+）：
  - `on`（默认）：临时文件写入 `proxy_temp_path` 目录；
  - `off`：临时文件直接写入缓存目录。

### 3. 共享内存配置（keys_zone）
- `keys_zone=name:size` 定义共享内存区域，用于存储活跃缓存键及其元数据。
- 内存估算：
  - 开源版：1MB 可存储约 8000 个键；
  - 商业版：1MB 可存储约 4000 个键（含扩展信息）。

### 4. 过期与容量清理
- `inactive=time`（默认 10m）：缓存项在指定时间内未被访问即删除，无论其新鲜度。
- `max_size=size`：当缓存总量超过此值，由“缓存管理器”按 LRU 删除数据。
  - `manager_files`（默认 100）：单次迭代最多删除文件数；
  - `manager_threshold`（默认 200ms）：单次迭代最大耗时；
  - `manager_sleep`（默认 50ms）：迭代间暂停时间。

### 5. 启动时缓存加载
- Nginx 启动后约 1 分钟，“缓存加载器”异步加载已有缓存元数据。
  - `loader_files`（默认 100）：单次加载文件数上限；
  - `loader_threshold`（默认 200ms）：单次加载最大耗时；
  - `loader_sleep`（默认 50ms）：加载批次间暂停时间。

### 6. 商业版清除功能（purger）
- `purger=on`：启用通配符缓存清除进程。
- 控制参数：
  - `purger_files`（默认 10）：单次扫描文件数；
  - `purger_threshold`（默认 50ms）：单次扫描最大耗时；
  - `purger_sleep`（默认 50ms）：扫描间暂停时间。

### 7. 版本兼容性注意
- Nginx 1.7.3 / 1.7.7 / 1.11.10 更改了缓存头格式，升级后旧缓存将失效，需预清空或重建。

## 触发条件
当用户需要配置 `proxy_cache_path` 以定义代理缓存的存储布局、内存使用、清理策略或加载行为时，应用本技能。