---
name: FastCGI缓存配置与生命周期管理
description: 配置Nginx的FastCGI响应缓存体系，包括共享内存区、磁盘存储路径及后台管理进程。当需要通过FastCGI缓存提升动态内容性能，并需控制缓存存储结构、过期策略或使用商业版purger功能时使用此技能。
---

# FastCGI缓存配置与生命周期管理

## 何时使用
- 需要缓存FastCGI后端（如PHP-FPM）生成的响应以提升性能
- 需要自定义缓存目录层级、内存索引大小或不活跃超时时间
- 需启用或调优cache manager/loader进程行为
- 使用Nginx Plus并需配置purger自动清理缓存

## 核心配置步骤

### 1. 配置缓存路径（http上下文）
使用 `fastcgi_cache_path` 指令定义缓存存储：
- 设置 `keys_zone=name:size` 创建共享内存区（1MB ≈ 8000键）
- 使用 `levels=1:2` 等参数控制目录层级结构
- 配置 `inactive=t` 定义不活跃缓存项的保留时间
- 通过 `use_temp_path=on|off` 控制临时文件写入位置

### 2. 启用缓存（location/server上下文）
- 使用 `fastcgi_cache zone_name;` 引用已定义的keys_zone
- 确保请求满足缓存条件（GET/HEAD方法、状态码可缓存、无nocache标志等）

### 3. 管理缓存生命周期
- **Cache Manager**：监控max_size，超限时按LRU删除；通过manager_*参数调优
- **Cache Loader**：启动后加载已有缓存元数据；通过loader_*参数控制加载节奏
- **Purger（商业版）**：启用purger=on并配置purger_*参数实现通配符清理

### 4. 控制缓存有效性
结合以下机制决定响应是否可缓存及有效期：
- `fastcgi_cache_valid` 指令
- 响应头：`X-Accel-Expires`、`Cache-Control`、`Expires`
- stale缓存策略

> 注意：`fastcgi_cache_path` 仅可在http上下文配置；purger为Nginx Plus功能。