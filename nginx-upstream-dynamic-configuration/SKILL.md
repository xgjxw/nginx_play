---
name: Nginx 上游服务器动态配置
description: 通过 Nginx Plus API 动态管理 HTTP/Stream 上游服务器的参数（如权重、状态、连接限制）。适用于需要运行时调整负载均衡行为、执行蓝绿部署或故障隔离的场景。
---

# Nginx 上游服务器动态配置

## 适用场景
- 使用 Nginx Plus（开源版不支持动态 API）
- 需要在不重载配置的情况下增删改上游服务器
- 实现自动化运维（如服务发现集成）

## 可配置参数

### HTTP 上游服务器
- **可修改**：`weight`, `max_conns`, `max_fails`, `fail_timeout`, `slow_start`, `down`, `drain`
- **不可修改**：`id`, `service`, `backup`, `parent`, `host`

### Stream 上游服务器
- 类似 HTTP，但无 `route` 和 `drain` 参数

## 关键约束
- `server` 字段若为域名，需在对应上下文（`http` 或 `stream`）配置 `resolver` 指令以支持 DNS 自动更新
- `backup` 服务器仅在主服务器不可用时使用
- `drain` 模式（HTTP）仅处理已有会话（如 sticky session）

## 操作流程
1. 确保已启用 Nginx Plus API 并配置 `status_zone`
2. 通过 POST/PUT/PATCH 请求 API 端点（如 `/api/8/http/upstreams/backend/servers`）
3. 提供 JSON 负载，仅包含可修改字段
4. 验证状态变更是否生效（如检查 `state` 字段）

> 注意：部分参数（如 `id`）由系统自动分配，创建后不可更改。