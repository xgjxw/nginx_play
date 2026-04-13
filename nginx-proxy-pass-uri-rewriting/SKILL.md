---
name: Nginx proxy_pass 请求转发与 URI 重写
description: 正确配置 proxy_pass 以转发请求并按规则重写 URI。当你需要将客户端请求代理到上游服务器，并控制最终传递的 URI 路径格式时使用本技能。
---

# Nginx proxy_pass 请求转发与 URI 重写

## 使用场景
在反向代理中，根据 location 匹配规则决定如何修改请求 URI 再转发给后端，常见于 API 网关、路径映射或微服务路由。

## 核心规则
### 情况 A：proxy_pass 包含 URI（如 `http://backend/remote/`）
- **行为**：匹配的 location 路径部分被替换为 proxy_pass 中的 URI
- **示例**：
  ```nginx
  location /api/ {
      proxy_pass http://backend/v1/;
  }
  ```
  → `/api/users` 转发为 `/v1/users`

### 情况 B：proxy_pass 不含 URI（如 `http://backend`）
- **行为**：原始请求 URI 完整传递
- **示例**：
  ```nginx
  location /service/ {
      proxy_pass http://backend;
  }
  ```
  → `/service/data` 转发为 `/service/data`

## 特殊限制（必须不带 URI）
- location 使用正则表达式（如 `location ~ ^/regex/`）
- location 内使用 `rewrite ... break;`
- proxy_pass 使用变量（如 `http://backend$request_uri`）

## 操作步骤
1. 确定 location 类型（前缀、正则、命名）
2. 根据是否需要 URI 替换决定 proxy_pass 是否包含路径
3. 避免在受限场景中错误添加 URI

> 错误配置会导致 404 或 URI 错乱，务必根据实际转发需求选择模式。