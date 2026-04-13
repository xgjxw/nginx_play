---
name: HTTP/2 TLS连接的ALPN要求检查
description: 检查在配置nginx启用HTTP/2 over TLS时是否满足ALPN（应用程序层协议协商）的OpenSSL版本要求。当用户配置了listen 443 ssl http2指令时，使用本技能验证底层OpenSSL是否支持ALPN，以确保HTTP/2能正常工作。
---

# HTTP/2 TLS连接的ALPN要求检查

## 何时使用
- 当你在nginx配置中使用`listen 443 ssl http2;`时
- 当你怀疑HTTP/2连接未生效或回退到HTTP/1.1时
- 在部署或升级TLS服务前验证环境兼容性

## 执行步骤
1. 确认当前系统使用的OpenSSL版本是否 ≥ 1.0.2。
2. 若OpenSSL版本低于1.0.2，则ALPN不可用，HTTP/2 over TLS将无法正确协商。
3. 注意：NPN（下一协议协商）扩展（OpenSSL 1.0.1起支持）不能替代ALPN用于HTTP/2。
4. 若不满足ALPN要求，即使配置了`http2`，客户端连接将回退至HTTP/1.1。
5. 发出警告：若OpenSSL版本不足，应提示“HTTP/2 over TLS可能无效”。

> **注意**：此检查仅适用于加密的HTTP/2（h2），不适用于明文HTTP/2（h2c）。