---
name: nginx-upstream-load-balancer-implementation
description: 开发或集成 Nginx 上游负载均衡器模块。当需要实现自定义负载均衡算法（如一致性哈希、最少连接）或将请求智能分发到多个后端服务器时使用本技能。
---

# Nginx 上游负载均衡器接口规范

## 触发条件
Nginx 需要将请求转发至上游服务器时，自动调用配置的负载均衡方法。

## 核心接口实现
### 配置阶段 (`init_upstream`)
- 创建高效数据结构（如权重数组、哈希环）
- 设置请求阶段初始化函数 `init`

### 请求阶段 (`init`)
- 为每个请求创建 `peer.data` 状态对象

### 服务器选择 (`get`)
- 填充 `pc->sockaddr`、`pc->socklen`、`pc->name`
- 返回状态码：
  - `NGX_OK`：成功
  - `NGX_ERROR`：内部错误
  - `NGX_BUSY`：无可用服务器
  - `NGX_DONE`：复用连接

### 连接释放 (`free`)
- 根据 `state` 位掩码更新服务器状态：
  - `NGX_PEER_FAILED`：连接失败
  - `NGX_PEER_NEXT`：非失败状态（如 404）
  - `NGX_PEER_KEEPALIVE`：保留连接

## 上游配置标志
支持的服务器参数由 `flags` 指示：
- `weight`、`max_fails`、`fail_timeout`
- `down`、`backup`、`max_conns`

## 配置类型区别
- **显式 upstream 块**：支持完整负载均衡选项
- **隐式 proxy_pass URL**：仅支持默认轮询

## 典型应用场景
- 实现基于会话粘性的负载均衡
- 集成外部服务发现系统
- 自定义健康检查逻辑