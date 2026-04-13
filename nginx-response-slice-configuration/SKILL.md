---
name: nginx-response-slice-configuration
description: 配置 Nginx 的响应切片模块（http_slice_module），用于对大文件响应进行高效缓存。当需要优化大文件（如视频、固件、大型静态资源）的缓存效率并减少回源压力时使用此技能。
---

# Nginx 响应切片模块配置

## 适用场景
- 需要缓存大文件响应（如 >10MB 的静态资源）
- 使用 Nginx 作为反向代理且启用了 proxy_cache
- 已使用 `--with-http_slice_module` 编译 Nginx

## 配置步骤
1. 在 `location` 块中使用 `slice size;` 指令启用切片，例如 `slice 1m;`。
2. 将 `$slice_range` 变量通过 `proxy_set_header Range $slice_range;` 传递给上游服务器。
3. 在 `proxy_cache_key` 中包含 `$slice_range`，确保不同切片有唯一缓存键。
4. 启用对状态码 206（Partial Content）的缓存：`proxy_cache_valid 200 206 1h;`。
5. 避免设置过小的切片大小（如 <64k），以防内存和文件描述符耗尽。

> **注意**：默认 `slice 0;` 表示禁用切片功能，必须显式设置正数大小才能启用。