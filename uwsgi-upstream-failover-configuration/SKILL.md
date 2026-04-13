---
name: uWSGI上游服务器故障转移配置
description: 配置uWSGI上游服务器组的自动故障转移机制，以在高可用架构中实现请求自动重试和切换。当需要在uWSGI服务器发生错误、超时或返回特定HTTP状态码时自动将请求转发至备用服务器，且尚未向客户端发送任何响应数据时，使用此技能。
---

# uWSGI上游服务器故障转移配置

## 何时使用
- 已配置多个uWSGI服务器组成上游服务器组
- 需要在服务器故障时自动切换请求，提升服务可用性
- 尚未向客户端发送任何响应内容（满足故障转移前提）

## 核心配置步骤

1. **启用故障转移指令**：在Nginx配置中使用 `uwsgi_next_upstream` 指令指定触发条件，例如：
   ```nginx
   uwsgi_next_upstream error timeout http_500;
   ```

2. **理解默认与可选失败条件**：
   - `error`、`timeout`、`invalid_header` 始终视为失败（即使未显式声明）
   - HTTP状态码如 `http_500`、`http_503`、`http_429` 需显式列出才触发故障转移
   - `http_403` 和 `http_404` 永不触发故障转移
   - 使用 `non_idempotent` 可允许对POST等非幂等请求重试（默认禁止）
   - 使用 `off` 禁用故障转移

3. **设置重试限制**：
   - 通过 `uwsgi_next_upstream_tries number;` 控制最大尝试次数（0表示无限制）
   - 通过 `uwsgi_next_upstream_timeout time;` 设置总故障转移时间上限（0表示无限制）

4. **与缓存协同优化**：
   - 结合 `uwsgi_cache_use_stale updating;` 在缓存更新期间提供陈旧响应
   - 使用 `uwsgi_cache_lock` 减少对上游服务器的重复穿透请求

> 注意：仅当未向客户端发送任何响应数据时，Nginx才会执行故障转移。