---
name: Nginx WebSocket 代理配置
description: 配置 Nginx 以正确代理 WebSocket 连接，确保 Upgrade 和 Connection 头部被正确传递，并处理连接超时。当需要通过 Nginx 反向代理实现实时双向通信（如聊天、实时通知）且客户端通过 /chat/ 等路径发起 WebSocket 请求时使用本技能。
---

# Nginx WebSocket 代理配置

## 使用场景
当你的应用通过 WebSocket 提供实时功能（如在线聊天、实时数据推送），且需经由 Nginx 反向代理访问后端服务时，必须显式配置 HTTP/1.1 升级机制，否则连接将失败。

## 基础配置步骤
1. **确认前提条件**：
   - Nginx 版本 ≥ 1.3.13
   - 后端服务支持 WebSocket
   - 客户端请求包含 `Upgrade: websocket` 和 `Connection: Upgrade`

2. **在 location 块中添加以下指令**：
   ```nginx
   location /your-websocket-path/ {
       proxy_pass http://backend;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
   }
   ```

3. **处理连接超时**：
   - 默认 60 秒无数据传输会断开连接
   - 添加 `proxy_read_timeout 300s;`（或其他合适值）延长超时

## 高级配置（推荐）
为避免非 WebSocket 请求错误升级，使用 `map` 动态设置 Connection 头：

```nginx
http {
    map $http_upgrade $connection_upgrade {
        default upgrade;
        ''      close;
    }
    server {
        location /your-websocket-path/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            proxy_read_timeout 300s;
        }
    }
}
```

> 注意：此配置不适用于 HTTP/1.0 或不支持 Upgrade 机制的旧协议。