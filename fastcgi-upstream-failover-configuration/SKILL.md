---
name: FastCGI上游故障转移配置
description: 配置Nginx的FastCGI上游服务器重试与故障转移机制，以在连接错误、超时或特定HTTP状态码下自动切换至备用服务器。当需要提升后端PHP或其他FastCGI应用的高可用性，且满足“尚未向客户端发送任何响应数据”等重试前提条件时使用本技能。
---

# FastCGI上游故障转移配置

## 使用场景
- 已配置多个FastCGI服务器（server group）
- 启用了`fastcgi_next_upstream`指令
- 需要在后端服务异常时自动重试其他节点，提高系统容错能力

## 执行步骤

### 1. 配置触发重试的错误条件
在Nginx配置中设置`fastcgi_next_upstream`，指定哪些情况视为失败并触发重试：
- `error`：连接、发送请求或读取响应头出错（始终视为失败）
- `timeout`：连接、发送或读取超时（始终视为失败）
- `invalid_header`：返回空或无效响应头（始终视为失败）
- `http_500`、`http_503`、`http_429`：仅当显式列出时才触发重试
- `non_idempotent`：允许重试POST等非幂等请求（需Nginx ≥1.9.13）
- `off`：禁用重试

> 注意：`http_403`和`http_404`从不视为失败，不可重试。

### 2. 设置重试限制
- 使用`fastcgi_next_upstream_tries N;`限制最大尝试次数（0表示无限制，默认为1）
- 使用`fastcgi_next_upstream_timeout T;`设置总重试时间上限（0表示无限制，默认为60秒）

### 3. 配置相关超时参数
- `fastcgi_connect_timeout`：建立连接超时（建议≤75秒）
- `fastcgi_send_timeout`：两次写操作之间的超时
- `fastcgi_read_timeout`：两次读操作之间的超时

### 4. 注意请求缓冲影响
若禁用`fastcgi_request_buffering`（Nginx ≥1.7.11），且已开始向后端发送请求体，则无法重试。确保在需要重试能力时启用请求缓冲或避免大请求体流式发送。

## 关键限制
- **仅当尚未向客户端发送任何响应数据时才能重试**
- 即使未在`fastcgi_next_upstream`中显式列出，`error`、`timeout`和`invalid_header`仍会触发重试逻辑

完成以上配置后，Nginx将在满足条件时自动将请求转发至下一可用FastCGI服务器，提升服务可用性。