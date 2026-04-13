---
name: Nginx Plus 状态 API 响应结构解析
description: 解析 Nginx Plus 状态 API 返回的 JSON 响应对象结构，用于监控运行状态、性能指标和健康状况。仅适用于 Nginx Plus（不适用于开源版），当用户请求 /api 或类似状态端点并需要理解返回字段含义时使用。
---

# Nginx Plus 状态 API 响应结构解析

## 适用场景
- 启用了 Nginx Plus 状态 API
- 需要从状态接口获取结构化监控数据
- 开发或配置监控系统（如 Prometheus、Grafana）对接 Nginx Plus

## 核心响应结构

Nginx Plus 状态 API 返回一个顶层 JSON 对象，包含以下主要子对象：

### 全局信息
- `nginx`: 包含 `version`（版本）、`build`（构建名）、`address`（服务器地址）、`generation`（配置重载次数）、`load_timestamp` 和 `timestamp`（ISO 8601 毫秒时间戳）、`pid`/`ppid`
- `respawned`: 异常终止并重生的子进程总数

### 连接与请求
- `connections`: `accepted`, `dropped`, `active`, `idle`
- `http_requests`: `total`, `current`

### SSL/TLS 统计
- `ssl`: `handshakes`, `handshakes_failed`, `session_reuses`

### 内存分配
- `slabs`: 按共享内存区域组织，包含 `pages`（used/free）和 `slots`（按大小分类的内存槽状态）

### HTTP 指标
- `http_server_zones`: 每个 zone 的 `processing`, `requests`, `responses`（按 1xx–5xx 分类）, `discarded`, `received`/`sent`
- `http_cache`: `size`/`max_size`/`cold` 及各类缓存命中统计（`hit`, `miss`, `bypass` 等）

### 上游服务器
- `http_upstreams` / `stream_upstreams`: `peers` 数组（每台服务器详细指标）、`keepalive`, `zombies`, `zone`, `queue`

### 其他
- `keyval` 区域、`stream server zones`、`sync` 节点、错误对象等

## 使用步骤
1. 确认使用的是 Nginx Plus（开源版无此 API）
2. 发送 GET 请求到已配置的状态 API 端点（如 `/api/8`）
3. 解析返回的 JSON，按上述结构提取所需指标
4. 将关键字段（如 `active` 连接数、`5xx` 响应数、`unhealthy` 服务器数）用于告警或可视化

> 注意：所有时间戳均为 ISO 8601 格式（毫秒精度）；状态码严格按 HTTP 标准分类。