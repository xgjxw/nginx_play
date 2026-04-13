---
name: nginx-proxy-embedded-variables
description: 提供 Nginx ngx_http_proxy_module 中 $proxy_host、$proxy_port 和 $proxy_add_x_forwarded_for 嵌入变量的定义与行为说明。当配置中使用 proxy_set_header 指令并引用这些变量时，应使用本技能来正确构造代理请求头。
---

# Nginx 代理嵌入变量使用指南

## 适用场景

- 配置了 `proxy_pass` 指令并启用了 `ngx_http_proxy_module` 模块
- 在 `proxy_set_header` 指令中使用 `$proxy_host`、`$proxy_port` 或 `$proxy_add_x_forwarded_for` 变量
- 需要动态设置 Host 头、端口信息或在多层代理中传递客户端 IP

## 核心操作步骤

1. **使用 `$proxy_host`**：
   - 该变量自动包含 `proxy_pass` 中指定的主机名和端口。
   - 在 `proxy_set_header Host $proxy_host;` 中用于正确转发 Host 头。

2. **使用 `$proxy_port`**：
   - 表示 `proxy_pass` 中指定的端口；若未显式指定，则使用协议默认端口（HTTP 为 80，HTTPS 为 443）。
   - 可用于条件判断或日志记录等场景。

3. **使用 `$proxy_add_x_forwarded_for`**：
   - 自动将客户端 IP（`$remote_addr`）追加到请求头 `X-Forwarded-For` 中。
   - 若原始请求已包含 `X-Forwarded-For`，则新值为原值加逗号和 `$remote_addr`；否则直接等于 `$remote_addr`。
   - 在多级代理架构中保留完整的客户端 IP 链。

> 注意：这些变量仅在通过 `proxy_pass` 发起的代理请求上下文中有效，不适用于非代理场景。