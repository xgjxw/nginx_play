---
name: nginx-scgi-cache-configuration
description: 配置Nginx对SCGI响应的缓存存储、生命周期、更新策略及清除机制。当需要通过缓存SCGI响应来减少后端负载、提升响应速度或处理高并发请求时使用。
---

# Nginx SCGI 缓存配置

## 触发场景
- 需要缓存SCGI动态内容以提升性能
- 面临缓存击穿、过期更新或缓存失效问题
- 需支持按条件清除缓存（商业版功能）

## 核心操作步骤

### 1. 定义缓存存储路径（在 `http` 上下文中）
```nginx
scgi_cache_path /path/to/cache
  levels=1:2
  keys_zone=mycache:10m
  inactive=60m
  use_temp_path=off;
```
- `levels`：目录层级结构（如 `1:2` 表示两级目录）
- `keys_zone`：共享内存区名称和大小（1MB ≈ 8000 个缓存键）
- `inactive`：未访问缓存项的保留时间
- `use_temp_path`：是否使用独立临时目录（推荐 `off` 减少IO）

### 2. 启用缓存并定义缓存键
在 `location` 或 `server` 中：
```nginx
scgi_cache mycache;                     # 启用名为 mycache 的缓存区
scgi_cache_key localhost:9000$request_uri;  # 定义唯一缓存键
```

### 3. 设置缓存有效期
```nginx
scgi_cache_valid 200 302 10m;   # 仅缓存指定状态码
scgi_cache_valid any 5m;        # 缓存所有响应
scgi_cache_min_uses 2;          # 响应被请求2次后才缓存
```

### 4. 配置缓存更新与容错
```nginx
scgi_cache_background_update on;  # 后台更新过期缓存，同时返回旧响应
scgi_cache_revalidate on;         # 使用条件请求验证过期项
scgi_cache_use_stale error timeout updating;  # 错误时使用过期缓存
```

### 5. 防止缓存击穿
```nginx
scgi_cache_lock on;             # 同一键只允许一个请求填充缓存
scgi_cache_lock_timeout 5s;     # 锁等待超时
scgi_cache_lock_age 5s;         # 填充超时后允许新请求
```

### 6. 缓存清除（商业版功能）
```nginx
scgi_cache_purge $request_uri;  # 满足条件时标记缓存项待删除
```
注意：通配符键（如 `/api/*`）仅标记，实际删除由 `purger` 进程或 `inactive` 触发。

### 7. 响应头对缓存的影响
- `X-Accel-Expires: 60` → 缓存60秒；`X-Accel-Expires: 0` → 禁用缓存
- `Set-Cookie` 或 `Vary: *` → 自动禁止缓存
- 可通过 `scgi_ignore_headers` 忽略这些头

## 注意事项
- `scgi_cache_path` 必须在 `http` 块中定义
- 商业功能（如 `scgi_cache_purge` 和 `purger` 参数）需有效订阅
- Nginx 版本影响功能可用性（如 `background_update` 需 ≥1.11.10）