---
name: Nginx HTTP 基本认证配置
description: 配置 Nginx 的 HTTP 基本认证（Basic Auth），用于保护 HTTP location、server 或 http block 中的资源。当需要对 Web 资源实施简单用户名/密码保护且配合 HTTPS 使用时触发。
---

# Nginx HTTP 基本认证配置

## 适用场景
- 需要对特定 URL 路径、虚拟主机或全局 HTTP 块启用密码保护
- 已有用户凭证文件（如通过 htpasswd 生成）
- **必须配合 HTTPS**，防止密码明文传输

## 配置步骤

### 1. 启用认证
在 `http`、`server`、`location` 或 `limit_except` 块中添加：
```nginx
auth_basic "Restricted Area";  # realm 值将显示在浏览器对话框中
```
使用 `auth_basic off;` 可取消继承自上级的认证。

### 2. 指定用户文件
```nginx
auth_basic_user_file /etc/nginx/.htpasswd;
```
文件格式：
```
# comment
user1:password1
user2:password2:optional_comment
```

### 3. 密码类型支持
- `crypt()`：传统 Unix 加密（htpasswd -d）
- `apr1`（MD5-based）：Apache 兼容（htpasswd 默认）
- `SSHA`（推荐）：加盐 SHA-1，防彩虹表攻击
- 避免使用 `PLAIN` 或无盐 `SHA`

### 4. 组合访问控制
可与其他限制（IP、JWT、子请求）结合，通过 `satisfy any|all;` 控制逻辑。

## 验证
- 成功：返回请求资源
- 失败：返回 `401 Unauthorized`，`WWW-Authenticate: Basic realm="..."`

> 安全提示：切勿在 HTTP 明文连接中使用基本认证。