---
name: Nginx 透明代理绑定配置
description: 配置 proxy_bind 或 fastcgi_bind 的 transparent 模式，使代理连接源 IP 伪装为客户端真实 IP。适用于需要保留原始客户端 IP 的高级网络架构（如 DSR、安全审计）。
---

# Nginx 透明代理绑定配置

## 适用场景
- 需要让后端服务器看到真实客户端 IP（而非 Nginx IP）
- 实现 Direct Server Return (DSR) 或类似网络拓扑
- 使用 FastCGI 或 HTTP/Stream 代理

## 配置指令

### HTTP/Stream 代理
```nginx
proxy_bind $remote_addr transparent;
```

### FastCGI
```nginx
fastcgi_bind $remote_addr transparent;
```

## 必要条件
- **Nginx 版本 ≥ 1.11.0**（transparent 参数）
- **权限要求**：
  - Linux ≥ 1.13.8：主进程自动授予 `CAP_NET_RAW`，无需 root
  - 其他系统：需以 superuser 权限运行 worker 进程
- **内核路由**：必须配置路由规则拦截返回流量（否则连接失败）

## 使用步骤
1. 在 `location`（HTTP/FastCGI）或 `server`（Stream）块中添加绑定指令
2. 确保系统满足权限和路由要求
3. 测试连接，验证后端收到的源 IP 是否为 `$remote_addr`

> 警告：不当配置会导致连接超时或拒绝；仅在明确需要时启用。