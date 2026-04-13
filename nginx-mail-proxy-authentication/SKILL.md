---
name: Nginx 邮件代理认证配置
description: 配置 Nginx 邮件模块（IMAP/POP3/SMTP）的 HTTP 认证后端和身份验证方法。适用于将邮件认证委托给外部 HTTP 服务的场景。
---

# Nginx 邮件代理认证配置

## 适用场景
- 使用 Nginx 作为邮件代理（非本地认证）
- 需要集成自定义认证服务（如 LDAP、数据库）
- 配置 POP3/IMAP/SMTP 身份验证方法

## 配置步骤

### 1. 设置 HTTP 认证后端
```nginx
mail {
    auth_http http://auth.example.com/mail;
    ...
}
```

### 2. 配置身份验证方法
- **POP3**：`pop3_auth plain apop cram-md5;`
- **SMTP**：`smtp_auth login plain cram-md5;`

> 注意：`plain`（USER/PASS、AUTH PLAIN/LOGIN）无法禁用；`apop`/`cram-md5` 要求密码明文存储。

### 3. 认证协议要点
- Nginx 向 `auth_http` 发送带 Headers 的请求（如 `Auth-User`, `Auth-Pass`）
- 成功响应需包含 `Auth-Status: OK` + `Auth-Server`/`Auth-Port`
- 失败时可返回 `Auth-Wait: N` 控制重试间隔
- **安全限制**：单会话无效尝试 ≤ 20 次，防止内存泄漏

## 验证
- 测试邮件客户端连接
- 检查认证服务收到的 Headers
- 确保错误处理符合预期（如 SMTP 535 错误）

> 警告：避免在认证服务中记录明文密码；限制暴力破解尝试。