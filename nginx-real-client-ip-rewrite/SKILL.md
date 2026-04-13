---
name: Nginx 真实客户端 IP 重写
description: 使用 ngx_http_realip_module 从可信代理头（如 X-Forwarded-For）重写 $remote_addr。适用于反向代理或负载均衡器后部署 Nginx 的场景，确保日志和访问控制使用真实客户端 IP。
---

# Nginx 真实客户端 IP 重写

## 适用场景
- Nginx 位于 CDN、负载均衡器或反向代理之后
- 需要基于真实客户端 IP 进行访问控制、速率限制或日志记录
- 已编译启用 `--with-http_realip_module`

## 配置步骤

### 1. 定义可信代理
```nginx
set_real_ip_from 192.168.1.0/24;  # CIDR、IP、UNIX 套接字或主机名
set_real_ip_from unix:;            # 信任所有 UNIX 套接字
```

### 2. 指定源头部
```nginx
real_ip_header X-Forwarded-For;   # 或 X-Real-IP、proxy_protocol 等
```
> 若使用 `proxy_protocol`，需在 `listen` 指令中启用 `proxy_protocol` 参数。

### 3. 启用递归解析（推荐）
```nginx
real_ip_recursive on;  # 跳过所有可信地址，取第一个非可信 IP
```

## 效果
- `$remote_addr` 和 `$remote_port` 被替换为真实客户端地址/端口
- 原始值保留在 `$realip_remote_addr` 和 `$realip_remote_port`（1.9.7+）

## 验证
- 检查访问日志中的 `$remote_addr` 是否为真实客户端 IP
- 确保访问控制规则（如 `allow/deny`）基于重写后的 IP 生效

> 安全提示：仅信任可控的代理地址，防止 IP 欺骗。