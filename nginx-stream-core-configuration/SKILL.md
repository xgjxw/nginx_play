---
name: Nginx Stream 核心配置
description: 配置 TCP/UDP 代理的监听套接字、访问控制、连接限制、日志和变量映射。适用于四层负载均衡、数据库代理或通用 TCP/UDP 转发场景。
---

# Nginx Stream 核心配置

## 适用场景
- 需要代理 TCP/UDP 流量（如 MySQL、Redis、DNS）
- 要求基于 IP 的访问控制或连接数限制
- 需要自定义流日志或动态变量映射

## 核心配置项

### 1. 监听套接字
```nginx
listen 127.0.0.1:3306 ssl udp proxy_protocol;
```
- 支持 IPv4/IPv6、UNIX 套接字、端口范围（1.15.10+）
- 关键参数：`ssl`, `udp`, `proxy_protocol`, `reuseport`, `so_keepalive`

### 2. 访问控制
```nginx
allow 192.168.1.0/24;
deny all;
```
- 规则按顺序匹配，首个匹配项生效

### 3. 连接限制
```nginx
limit_conn_zone $binary_remote_addr zone=addr:10m;
limit_conn addr 10;
```
- 共享内存区域存储连接状态
- 超限时直接关闭连接

### 4. 日志与变量
- **日志格式**：`log_format` 定义，支持 `$remote_addr`, `$protocol` 等
- **变量映射**：`map $remote_addr $backend { ... }` 实现动态 upstream

## 验证
- 测试连接是否被正确代理
- 检查访问日志格式和内容
- 验证连接限制是否生效

> 注意：不同 server 必须监听不同 address:port；包含变量的日志路径有性能影响。