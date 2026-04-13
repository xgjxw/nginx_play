---
name: nginx-dynamic-upstream-configuration
description: 动态管理 Nginx 上游服务器组（HTTP 或 Stream）的配置，包括查看、添加、删除和修改服务器。当用户需要通过 HTTP 接口实时调整 upstream 配置（如扩缩容、故障隔离或权重调整）时使用此技能。
---

# Nginx 动态上游配置操作

## 适用场景
- 在运行时动态增删改查 Nginx upstream 服务器
- 实现服务发现、蓝绿部署或故障转移等运维自动化
- 调试或监控当前 upstream 状态

## 前提条件
1. 在 `location` 块中已启用 `upstream_conf` 接口
2. 若使用域名作为服务器地址，需在 `http` 或 `stream` 块中配置 `resolver`
3. 若配合健康检查，服务器组必须位于共享内存中

## 操作步骤

### 1. 确定操作对象
请求必须包含以下参数组合之一：
- **仅 `upstream=name`**：操作整个 HTTP 上游组
- **`stream=&upstream=name`**：操作 Stream 上游组
- **`upstream=name&id=number`**：操作组内特定服务器（由 ID 引用）

### 2. 执行具体操作
根据需求附加操作参数：
- **查看配置**：仅提供 `upstream`（可选 `id`）
- **添加服务器**：必须包含 `add=` 和 `server=address`；可选其他属性（如 `weight=`、`backup=` 等）
- **删除服务器**：必须包含 `remove=` 和 `id=`
- **修改服务器**：指定 `id=` 和要变更的参数（如 `down=`、`up=`、`weight=` 等）

### 3. 处理特殊行为
- 使用 `drain=` 将 HTTP 服务器置入排水模式（仅处理已有会话）
- `up=` 与 `down=` 互为反向操作
- 在 Nginx 1.7.2 之前，操作备份服务器需显式指定 `backup=` 参数

## 注意事项
- 此接口仅在 `location` 上下文中有效
- 新增服务器将自动分配唯一 ID，并在响应中返回
- 域名解析依赖 `resolver`，Nginx 1.7.2+ 支持自动更新 IP 变化