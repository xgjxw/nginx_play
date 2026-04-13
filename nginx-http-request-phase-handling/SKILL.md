---
name: Nginx HTTP 请求阶段处理逻辑
description: 本技能用于理解和控制 Nginx 处理 HTTP 请求时的 11 个阶段及其处理程序执行逻辑。当需要开发或调试 Nginx 模块、配置自定义处理逻辑、分析请求流程或排查阶段行为异常时使用。
---

# Nginx HTTP 请求阶段处理逻辑

## 何时使用
- 开发 Nginx C 模块并需注册自定义阶段处理程序
- 调试请求在特定阶段（如重写、访问控制、内容生成）的行为
- 分析为何某些处理程序未被调用（例如误在不可注册阶段注册）
- 理解处理程序返回码对请求流程的影响

## 核心处理阶段
Nginx 按顺序执行以下 11 个 HTTP 请求处理阶段：

1. **NGX_HTTP_POST_READ_PHASE**：首阶段，可用于替换客户端地址。
2. **NGX_HTTP_SERVER_REWRITE_PHASE**：处理 `server` 块中的重写指令。
3. **NGX_HTTP_FIND_CONFIG_PHASE**：根据 URI 选择 `location`；**不可注册自定义处理程序**。
4. **NGX_HTTP_REWRITE_PHASE**：处理 `location` 中的重写规则。
5. **NGX_HTTP_POST_REWRITE_PHASE**：若 URI 被修改则触发内部跳转；**不可注册自定义处理程序**。
6. **NGX_HTTP_PREACCESS_PHASE**：通用预访问处理（如限流、延迟检查）。
7. **NGX_HTTP_ACCESS_PHASE**：执行访问控制（如 `auth_basic`）。
8. **NGX_HTTP_POST_ACCESS_PHASE**：处理 `satisfy any` 指令；**不可注册自定义处理程序**。
9. **NGX_HTTP_PRECONTENT_PHASE**：内容生成前处理（如 `try_files`）。
10. **NGX_HTTP_CONTENT_PHASE**：生成响应内容（如 proxy_pass、静态文件服务）。
11. **NGX_HTTP_LOG_PHASE**：记录访问日志。

## 处理程序返回码语义
- **NGX_OK**：当前处理完成，进入下一阶段。
- **NGX_DECLINED**：当前处理程序不处理，交由同阶段下一个处理程序；若为最后一个，则进入下一阶段。
- **NGX_AGAIN / NGX_DONE**：暂停处理，等待异步事件（如 I/O 完成）。
- **其他值（如 HTTP 状态码）**：视为请求已完成，直接返回响应。

> **注意**：在 `NGX_HTTP_CONTENT_PHASE` 中，除 `NGX_DECLINED` 外的所有返回码均被视为完成码。

## 特殊行为
- 在 `satisfy any` 模式下，`NGX_HTTP_ACCESS_PHASE` 中任一处理程序返回非拒绝码（即 OK/DECLINED/AGAIN/DONE）即可允许请求通过。
- 不可注册处理程序的阶段（FIND_CONFIG、POST_REWRITE、POST_ACCESS）会跳过用户模块回调。

执行此技能以正确注册处理程序、解读返回码影响，并预测请求在 Nginx 内部的流转路径。