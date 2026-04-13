---
name: proxy_cache缓存核心配置与键生成
description: 配置Nginx代理缓存（proxy_cache）的核心参数，包括缓存启用、缓存键生成规则及有效期控制。当需要缓存反向代理的HTTP响应，并需自定义缓存键、有效期或绕过/禁止缓存逻辑时使用此技能。
---

# proxy_cache缓存核心配置与键生成

## 何时使用
- 需要缓存上游HTTP服务（如API、静态资源服务器）的响应
- 需自定义缓存键以区分用户会话、设备类型等维度
- 需按HTTP状态码设置不同缓存时间
- 需根据请求条件动态跳过读取或写入缓存

## 核心配置步骤

### 1. 启用缓存
- 在http/server/location上下文中使用 `proxy_cache zone_name;`（zone_name来自proxy_cache_path定义）
- 使用 `proxy_cache off;` 禁用继承的缓存

### 2. 定义缓存键
- 默认键：`$scheme$proxy_host$request_uri`
- 自定义键：通过 `proxy_cache_key "表达式";`，例如包含 `$cookie_user` 或 `$http_accept_language`
- 键经MD5哈希后作为缓存文件名

### 3. 设置缓存有效期
- 使用 `proxy_cache_valid` 按状态码设置时间：
  - `proxy_cache_valid 200 302 10m;`
  - `proxy_cache_valid any 5m;` 缓存所有响应
- 响应头优先级更高：`X-Accel-Expires` > `Expires`/`Cache-Control`
- 含 `Set-Cookie` 或 `Vary: *` 的响应默认不缓存

### 4. 控制缓存行为
- **跳过读取缓存**：`proxy_cache_bypass $condition;`
- **禁止写入缓存**：`proxy_no_cache $condition;`
- **忽略响应头**：`proxy_ignore_headers Cache-Control Expires Set-Cookie;`

> 注意：proxy_cache仅适用于http/server/location上下文；缓存路径必须预先通过proxy_cache_path定义。