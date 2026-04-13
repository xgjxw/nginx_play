---
name: Nginx SSL/TLS 安全代理配置
description: 配置 Nginx 作为 SSL/TLS 终端（HTTPS 服务器）或加密代理（到上游的 SSL 连接）。适用于需要端到端加密、证书验证或 OCSP Stapling 的安全场景。
---

# Nginx SSL/TLS 安全代理配置

## 适用场景
- 配置 HTTPS 服务器（终端 TLS）
- 代理到上游的 SSL/TLS 连接（Stream 或 HTTP）
- 需要双向认证、SNI 或证书吊销检查

## 核心配置

### 1. 终端 TLS（HTTPS）
```nginx
listen 443 ssl;
ssl_certificate /path/to/cert.pem;
ssl_certificate_key /path/to/key.pem;
ssl_protocols TLSv1.2 TLSv1.3;  # 禁用旧协议
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_session_cache shared:SSL:10m;  # 多进程共享
ssl_stapling on;                  # 需 resolver 和完整证书链
```

### 2. 代理到上游的 SSL
```nginx
proxy_ssl on;
proxy_ssl_verify on;              # 验证上游证书
proxy_ssl_trusted_certificate /path/to/ca.pem;
proxy_ssl_name backend.example.com;  # SNI 主机名
proxy_ssl_server_name on;         # 启用 SNI
```

## 安全最佳实践
- 使用 `shared` 会话缓存（非 `builtin`）
- 启用 OCSP Stapling 减少握手延迟
- 设置 `ssl_prefer_server_ciphers on`
- 客户端证书验证：`ssl_verify_client on|optional`

## 验证
- 使用 `openssl s_client` 测试连接
- 检查 `$ssl_protocol`、`$ssl_cipher` 变量

> 注意：部分功能依赖 OpenSSL 版本（如 TLSv1.3 需 1.1.1+）。