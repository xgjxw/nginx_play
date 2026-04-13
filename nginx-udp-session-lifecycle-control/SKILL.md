---
name: Nginx UDP 会话生命周期控制
description: 配置 proxy_requests 和 proxy_responses 控制 UDP 代理会话的生命周期。适用于 DNS、Syslog 等无连接协议，防止资源长期占用。
---

# Nginx UDP 会话生命周期控制

## 适用场景
- 使用 Nginx Stream 模块代理 UDP 流量（如 DNS 查询）
- 需要自动终止“伪会话”以释放资源
- Nginx 版本 ≥ 1.15.7（proxy_requests）或 ≥ 1.9.13（proxy_responses）

## 配置指令

### 1. 请求阈值
```nginx
proxy_requests 1;  # 客户端发送 1 个包后，下次请求启动新会话
```

### 2. 响应阈值
```nginx
proxy_responses 1;  # 收到 1 个响应后终止会话
proxy_responses 0;  # 不期望响应（但仍处理意外响应）
```

## 会话终止条件（满足任一即终止）
- 达到 `proxy_responses` 指定的响应数
- 达到 `proxy_requests` 指定的请求数
- 超过 `proxy_timeout` 设定的超时时间

## 使用建议
- DNS 场景：通常设 `proxy_responses 1`
- Syslog 场景：可能设 `proxy_responses 0`（单向日志）

> 注意：此机制仅适用于 Stream 模块中的 UDP，TCP 连接不适用。