---
name: nginx-error-handling-and-logging
description: 在 Nginx 开发中，当系统调用或 socket 操作失败时，使用本技能获取跨平台错误码、优化性能并记录结构化日志。适用于涉及系统调用封装函数、错误处理代码或日志记录模块的场景。
---

# Nginx 错误处理与日志记录

## 何时使用
- 系统调用（如 `kill`、`open`）或 socket 操作返回失败
- 需要在日志中记录包含上下文和错误文本的结构化错误信息
- 编写跨平台兼容的 Nginx 模块代码

## 执行步骤

1. **获取错误码**
   - 使用 `ngx_errno` 宏获取上一个系统错误码（POSIX → `errno`，Windows → `GetLastError()`）
   - 使用 `ngx_socket_errno` 宏获取上一个 socket 错误码（POSIX → `errno`，Windows → `WSAGetLastError()`）

2. **性能优化**
   - 若需多次引用错误值，将其存储在 `ngx_err_t` 类型的本地变量中，避免重复调用宏

3. **设置错误码（如需）**
   - 使用 `ngx_set_errno(errno)` 设置系统错误码
   - 使用 `ngx_set_socket_errno(errno)` 设置 socket 错误码

4. **记录日志**
   - 将错误码作为参数传给 `ngx_log_error()` 或 `ngx_log_debugx()`，系统自动附加错误文本

> 注意：仅适用于涉及系统调用或 socket 操作的函数，不适用于纯业务逻辑无系统调用的场景。