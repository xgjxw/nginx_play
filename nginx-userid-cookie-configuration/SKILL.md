---
name: nginx-userid-cookie-configuration
description: 配置和管理 ngx_http_userid_module 模块的 Cookie 属性、标记机制及 userid 指令行为。当用户在 nginx 配置中使用 userid、userid_name、userid_domain、userid_path、userid_expires、userid_p3p、userid_mark 或 userid_service 指令时，应使用此技能。
---

# Nginx 用户标识 Cookie 配置

## 何时使用

在以下任一情况下使用本技能：
- 在 nginx 的 http、server 或 location 块中配置了 `userid` 指令（值为 on、v1、log 或 off）
- 设置了 `userid_name`、`userid_domain`、`userid_path`、`userid_expires`、`userid_p3p`、`userid_mark` 或 `userid_service` 指令
- 需要控制用户跟踪 Cookie 的生成、过期、域路径、隐私策略（P3P）或跨服务器一致性

## 如何执行

### 第一步：确认前提条件
确保满足以下条件：
- 已加载 `ngx_http_userid_module` 模块
- `userid` 指令设为 `on` 或 `v1`（若需设置 Cookie）

### 第二步：配置 Cookie 属性
按需设置以下指令（均适用于 http/server/location 上下文）：

- **Cookie 名称**：`userid_name name;`（默认 `'uid'`）
- **Cookie 域**：`userid_domain name | none;`（默认 `none`，即不设置 Domain）
- **Cookie 路径**：`userid_path path;`（默认 `'/'`）
- **过期时间**：`userid_expires time | max | off;`
  - 具体时间（如 `365d`）：设置绝对过期
  - `max`：过期时间为 `31 Dec 2037 23:55:55 GMT`
  - `off`（默认）：会话 Cookie（浏览器关闭即失效）
- **P3P 头**：`userid_p3p string | none;`（默认 `none`，不发送 P3P）

### 第三步：启用标记机制（可选）
- 使用 `userid_mark letter | digit | = | off;`（默认 `off`）
- 标记字符必须是英文字母（区分大小写）、数字或 `=`
- 启用后，当 P3P 或过期时间变更时，系统通过比较标记与 Cookie 中 base64 标识的第一个填充符决定是否重发 Cookie

### 第四步：配置多服务器环境（可选）
- 使用 `userid_service number;` 确保客户端标识唯一
  - v1 Cookie 默认值：`0`
  - v2 Cookie 默认值：由服务器 IP 最后四个字节组成的整数

### 第五步：设置 userid 指令行为
根据需求选择 `userid` 模式：
- `on`：允许设置 v2 Cookie 并记录收到的 Cookie
- `v1`：允许设置 v1 Cookie 并记录收到的 Cookie
- `log`：禁止设置 Cookie，但允许记录收到的 Cookie
- `off`（默认）：禁止设置和记录 Cookie

> 注意：`$uid_got` 和 `$uid_set` 变量的可用性直接受 `userid` 指令值影响。

### 第六步：验证约束
- `userid_mark` 仅在非 `off` 时生效
- `userid_service` 仅在多服务器部署时需显式配置
- 未启用模块的 nginx 实例无法使用此功能