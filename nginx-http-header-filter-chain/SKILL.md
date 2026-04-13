---
name: nginx-http-header-filter-chain
description: 实现或调试 Nginx HTTP 响应头过滤器链机制。当需要在 ngx_http_send_header(r) 调用时插入自定义响应头处理逻辑（如添加、修改或删除响应头）时使用本技能。
---

# Nginx HTTP 响应头过滤器链机制

## 触发条件
调用 `ngx_http_send_header(r)` 时自动触发标头过滤器链执行。

## 核心流程
1. **获取链起点**：从全局变量 `ngx_http_top_header_filter` 获取第一个过滤器处理程序。
2. **链式调用**：每个过滤器必须调用保存在模块静态变量（如 `ngx_http_next_header_filter`）中的下一个处理程序。
3. **最终处理**：链末端为 `ngx_http_header_filter(r)`，负责根据 `r->headers_out` 构造完整 HTTP 响应头。
4. **输出传递**：构造完成后交由 `ngx_http_writer_filter` 输出。

## 添加自定义过滤器
在模块的 `postconfiguration` 阶段：
- 将自身处理函数地址赋值给 `ngx_http_top_header_filter`
- 将原值保存到模块静态变量（如 `ngx_http_next_header_filter`）

## 关键约束
- 仅适用于 HTTP 模块上下文，不适用于 Stream 或 Mail 模块
- 必须确保链式调用不中断，否则响应头无法正确发送

## 典型应用场景
- 动态添加安全头（如 `Strict-Transport-Security`）
- 移除敏感响应头
- 根据请求上下文重写缓存控制头