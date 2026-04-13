---
name: HTTP/2 密码套件黑名单合规检查
description: 检查启用了 HTTP/2 和 ssl_prefer_server_ciphers=on 的服务器（如 nginx）所配置的 SSL 密码套件是否符合 RFC 7540 Appendix A 黑名单要求。当用户配置或排查 HTTP/2 SSL 连接问题，特别是遇到浏览器拒绝连接（如 Chrome 报错）时使用此技能。
---

# HTTP/2 密码套件黑名单合规检查

## 何时使用
- 配置了 nginx 或其他支持 HTTP/2 的服务器
- 启用了 `ssl_prefer_server_ciphers on;`
- 同时启用了 HTTP/2
- 出现浏览器拒绝 HTTPS 连接、TLS 握手失败等问题

## 执行步骤
1. 确认服务器已启用 HTTP/2 且 `ssl_prefer_server_ciphers` 设置为 `on`。
2. 获取当前配置的 `ciphers` 列表。
3. 对照 RFC 7540 Appendix A 定义的黑名单，检查是否存在禁止使用的密码套件（例如包含静态 RSA 密钥交换或 CBC 模式的组合）。
4. 若发现黑名单中的密码套件，立即移除并替换为推荐的现代安全套件（如 ECDHE+AESGCM）。
5. 验证新配置是否被主流客户端（如 Chrome、Firefox）接受。

> **注意**：若未启用 `ssl_prefer_server_ciphers`，本规则不适用；但若启用，则必须遵守 RFC 7540 黑名单，否则可能导致 HTTP/2 连接被强制拒绝。