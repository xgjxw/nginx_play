---
name: FastCGI缓存控制与失效策略
description: 控制Nginx中FastCGI缓存的命中、写入、过期使用及清除行为。当配置了fastcgi_cache并需要根据请求变量、响应状态或错误条件动态决定缓存行为时使用本技能，适用于http、server或location上下文。
---

# FastCGI缓存控制与失效策略

## 使用场景
- 需要根据用户请求（如cookie、URL参数）跳过缓存
- 响应包含敏感数据（如Set-Cookie）时禁止缓存
- 后端故障或超时时仍希望返回过期缓存内容
- 主动清除特定缓存条目（需商业版Nginx）

## 核心操作流程

### 1. 缓存绕过（`fastcgi_cache_bypass`）
若任一指定变量非空且不等于"0"，则跳过缓存，直接转发请求至后端。

### 2. 禁止缓存（`fastcgi_no_cache`）
若任一指定变量非空且不等于"0"，则不将当前响应写入缓存。可与`fastcgi_cache_bypass`同时使用。

### 3. 使用过期缓存（`fastcgi_cache_use_stale`）
在指定错误条件下允许返回过期缓存项，包括：
- `error`：无法选择后端服务器
- `timeout`：与后端通信超时
- `updating`：缓存正在更新（配合`fastcgi_cache_lock`减少穿透）
- `http_500`等HTTP错误状态
- 支持响应头`stale-while-revalidate`和`stale-if-error`

### 4. 缓存清除（`fastcgi_cache_purge`）
若任一参数非空且≠"0"，则删除对应缓存键的条目。支持通配符`*`匹配多个键（仅商业版支持），成功时返回204。

### 5. 缓存有效期（`fastcgi_cache_valid`）
按HTTP状态码设置缓存时间（如`200 10m`）。注意：
- 响应头`X-Accel-Expires`、`Expires`、`Cache-Control`优先级更高
- 若响应含`Set-Cookie`或`Vary: *`，默认不缓存

## 触发条件
当满足以下任一条件时应用相应策略：
- 请求变量触发`bypass`或`no_cache`
- 后端返回错误且配置了`use_stale`
- 收到明确的缓存清除请求
- 响应状态码匹配`valid`规则

> **注意**：所有指令仅在已启用`fastcgi_cache`的前提下生效。