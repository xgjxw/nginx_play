---
name: nginx-http-request-lifecycle
description: 理解并操作 Nginx HTTP 请求处理的完整生命周期及核心请求对象结构。当需要在特定阶段拦截请求、访问关键字段或调试请求处理流程时使用本技能。
---

# Nginx HTTP 请求生命周期与核心结构

## 触发条件
新的 HTTP 客户端 TCP 连接建立时自动启动完整生命周期。

## 生命周期关键阶段
1. **连接接受**：`ngx_event_accept()` 创建 `ngx_connection_t`
2. **HTTP 初始化**：`ngx_http_init_connection()` 设置 PROXY/SSL
3. **请求创建**：`ngx_http_wait_request_handler()` 创建 `ngx_http_request_t`
4. **请求行解析**：`ngx_http_process_request_line()`
5. **请求头解析**：`ngx_http_process_request_headers()`
6. **阶段执行**：`ngx_http_core_run_phases()` 运行各处理阶段
7. **请求终结**：`ngx_http_finalize_request()` 处理响应/错误
8. **连接清理**：`ngx_http_finalize_connection()` 处理 keepalive 或关闭

## ngx_http_request_t 关键字段
- `connection`：客户端连接指针（多请求可共享）
- `ctx`：模块上下文数组（按 `ctx_index` 存储）
- `main_conf/srv_conf/loc_conf`：配置数组
- `headers_in/headers_out`：输入/输出头对象
- `uri/args/exten`：当前 URI 信息（可能变化）
- `main/parent`：主/父请求指针
- `count`：主请求引用计数（影响销毁时机）
- `subrequests`：子请求嵌套级别（上限 `NGX_HTTP_MAX_SUBREQUESTS`）
- `uri_changes`：剩余 URI 更改次数（上限 `NGX_HTTP_MAX_URI_CHANGES`）
- `blocked/buffered`：挂起/缓冲状态（非零时不能终止）

## 典型应用场景
- 在特定阶段插入自定义处理逻辑
- 调试请求处理异常（如过早销毁）
- 实现复杂子请求逻辑
- 访问或修改请求上下文数据