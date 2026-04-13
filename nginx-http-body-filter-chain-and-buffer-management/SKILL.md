---
name: nginx-http-body-filter-chain-and-buffer-management
description: 实现或调试 Nginx HTTP 响应体过滤器链及缓冲区管理机制。当需要在 ngx_http_output_filter(r, cl) 调用时处理响应正文内容（如压缩、加密、转换格式）并正确管理缓冲区生命周期时使用本技能。
---

# Nginx HTTP 响应体过滤器链与缓冲区处理

## 触发条件
调用 `ngx_http_output_filter(r, cl)` 时自动触发主体过滤器链执行。

## 核心流程
1. **获取链起点**：从全局变量 `ngx_http_top_body_filter` 获取第一个过滤器处理程序。
2. **处理缓冲区链**：每个过滤器接收 `ngx_chain_t* in`，不得修改原始链结构。
3. **安全修改内容**：若需变更缓冲区内容或顺序，必须分配新的 `ngx_chain_t` 链。
4. **状态维护**：可使用上下文（ctx）保存每请求状态（如字节计数）。
5. **缓冲区回收**：通过 `ngx_chain_update_chains(free, busy, out, tag)` 自动回收已耗尽缓冲区。

## 缓冲区重用规则
- 仅当缓冲区 `tag` 与模块标识匹配时才允许重用
- 已耗尽缓冲区满足 `pos == last`（内存）或 `file_pos == file_last`（文件）

## 关键约束
- 不得重用或修改传入的 `ngx_chain_t` 链结构
- 必须正确维护 `free` 和 `busy` 链以避免内存泄漏

## 典型应用场景
- Gzip 压缩响应体
- 内容替换（如广告注入）
- 流式数据转换（如 JSON 到 XML）