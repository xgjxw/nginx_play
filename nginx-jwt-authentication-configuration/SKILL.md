---
name: Nginx JWT 身份验证配置
description: 配置 Nginx 的 ngx_http_auth_jwt_module 模块以验证 HTTP 请求中的 JWT 令牌。当用户需要在 Nginx 中启用基于 JWT 的访问控制（如保护 API 端点或集成 OpenID Connect）时使用此技能。
---

# Nginx JWT 身份验证配置

## 何时使用
- 请求中包含 JWT 且需通过 Nginx 验证其有效性
- 使用商业版 Nginx Plus 实现基于令牌的身份验证
- 需要与 auth_basic、auth_request 等其他访问控制模块协同工作

## 核心操作步骤

1. **确认前提条件**：
   - JWT 必须采用 JWS（JSON Web Signature）结构编码
   - 准备密钥文件或 JWKS（JSON Web Key Set）的请求 URI

2. **配置 JWT 获取位置**：
   - 默认从 `Authorization: Bearer <token>` 头部读取
   - 可通过 `auth_jwt` 指令的 `token=` 参数指定自定义变量（如 `$cookie_auth_token` 或查询参数）

3. **指定密钥来源**：
   - 使用 `auth_jwt_key_file` 加载本地 JWKS 文件
   - 或使用 `auth_jwt_key_request` 向内部端点发起请求动态获取 JWKS

4. **设置签名算法支持**：
   - 确保使用的算法（HS256/RS256/ES256 等）受当前 Nginx 版本支持
   - 注意：1.13.7 之前仅支持 HS256、RS256、ES256

5. **配置时间容差（可选）**：
   - 使用 `auth_jwt_leeway` 指令（1.13.10+）设置 exp/nbf 声明的时钟偏差容差（单位：秒）

6. **与其他访问控制模块组合**：
   - 结合 `satisfy any|all` 指令，实现多条件授权逻辑

7. **验证结果处理**：
   - 验证成功：允许请求继续处理
   - 验证失败：返回 HTTP 401 Unauthorized

> 注意：此功能仅在 Nginx 商业订阅版本（Nginx Plus）中可用。