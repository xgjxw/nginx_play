---
name: nginx-secure-link-verification
description: 配置和使用 Nginx 的 ngx_http_secure_link_module 模块，以保护资源链接免遭未授权访问或限制其有效期。当需要为静态资源（如下载文件、媒体内容）生成带时效性或防盗链的安全 URL 时使用本技能。
---

# Nginx 安全链接验证

## 使用前提

- 编译 Nginx 时必须添加 `--with-http_secure_link_module` 参数。
- 在配置中设置密钥（secret）或 MD5 表达式。

## 选择操作模式

该模块提供两种互斥的验证模式，根据需求选择其一：

### 基础模式（secure_link_secret）
适用于简单场景，仅依赖 URI 中的哈希值进行验证。

1. 在 `location` 块中配置 `secure_link_secret word;`。
2. 构造请求 URI 格式为 `/prefix/hash/link`，其中：
   - `hash = MD5_hex(link + secret_word)`
3. 验证结果通过 `$secure_link` 变量体现：
   - 成功：`$secure_link` 等于提取出的 `link` 部分
   - 失败：`$secure_link` 为空字符串
4. 配合内部重定向实现资源访问控制。

### 增强模式（secure_link + secure_link_md5）
支持时效控制和客户端绑定，适用于高安全要求场景。

1. 配置 `secure_link expression;` 以提取校验和与过期时间（如 `$arg_md5,$arg_expires`）。
2. 配置 `secure_link_md5 expression;` 定义预期 MD5 的计算逻辑，必须包含：
   - 过期时间（若启用）
   - 请求 URI
   - 密钥（secret）
   - 可选客户端标识（如 `$remote_addr`）
3. 验证结果由 `$secure_link` 表示：
   - `""`：校验失败 → 返回 403
   - `"0"`：校验通过但已过期 → 返回 410
   - `"1"`：有效链接 → 允许访问

## 安全最佳实践

- 在 MD5 表达式中加入客户端特征（如 IP 地址），防止链接被他人复用。
- 合理设置过期时间戳（Unix 时间），避免长期有效的链接带来风险。
- 使用 base64url 编码（替换 `+`/`/` 为 `-`/`_`，并去除填充 `=`）处理增强模式的哈希值。

## 执行流程

1. 确认 Nginx 已编译 secure_link 模块。
2. 根据安全需求选择基础或增强模式。
3. 在对应 `location` 中配置指令。
4. 生成符合格式的安全链接（参考哈希生成方法）。
5. 利用 `$secure_link` 变量控制访问响应（如返回错误或内部重写）。