---
name: Nginx proxy_store 静态缓存配置
description: 配置 Nginx 将代理响应保存为本地静态文件，实现简单缓存机制。当需要为不可变静态资源（如图片、CSS、JS）创建本地副本以提升后续请求性能时使用本技能。
---

# Nginx proxy_store 静态缓存配置

## 使用场景
适用于内容长期不变的静态资源，通过首次回源拉取并本地存储，使后续请求直接由 Nginx 静态服务，减少后端负载。

## 配置步骤
1. **定义主 location 处理静态请求**：
   ```nginx
   location /static/ {
       root /data/www;
       error_page 404 = @fetch;
   }
   ```

2. **定义内部回源 location 并启用 proxy_store**：
   ```nginx
   location @fetch {
       internal;
       proxy_pass http://backend;
       proxy_store on;
       proxy_store_access user:rw group:rw all:r;
       proxy_temp_path /data/temp;
       root /data/www;
   }
   ```

3. **关键注意事项**：
   - `proxy_temp_path` 与最终存储路径应位于**同一文件系统**以避免复制开销
   - 文件权限由 `proxy_store_access` 控制
   - 不适用于动态或频繁变更的内容

> 成功配置后，首次请求缺失资源将触发回源，响应被保存为本地文件，后续相同请求直接返回静态文件。