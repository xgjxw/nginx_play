---
name: nginx C 数据类型规范
description: 在编写或修改 nginx 内部 C 源码时，正确使用 nginx 定义的整数与字符串类型（如 ngx_int_t、ngx_uint_t 和 ngx_str_t），并遵循其初始化和头文件包含规范。当开发核心模块、HTTP/邮件/流模块等 nginx C 代码且涉及字符串或整数操作时，应触发此技能。
---

# nginx C 数据类型规范

## 使用场景
当你在编写或修改 nginx 的 C 源码（包括核心模块、HTTP 模块、邮件模块或流模块）并需要处理整数或字符串时，必须遵循本规范。

## 执行步骤

### 1. 整数类型
- **有符号整数**：始终使用 `ngx_int_t`（即 `intptr_t` 的 typedef）。
- **无符号整数**：始终使用 `ngx_uint_t`（即 `uintptr_t` 的 typedef）。

### 2. 字符串类型
- **原始 C 字符串**：使用 `u_char *`（无符号字符指针）。
- **nginx 字符串结构**：使用 `ngx_str_t`，其定义为：
  ```c
  typedef struct { size_t len; u_char *data; } ngx_str_t;
  ```
  - 注意：`ngx_str_t` 中的字符串通常**不以空字符结尾**，仅在配置解析等特定上下文中可能为空终止。

### 3. 必须包含的头文件
- 所有 nginx C 文件开头必须包含：
  ```c
  #include <ngx_config.h>
  #include <ngx_core.h>
  ```
- 根据模块类型额外包含：
  - HTTP 模块：`#include <ngx_http.h>`
  - 邮件模块：`#include <ngx_mail.h>`
  - 流模块：`#include <ngx_stream.h>`

### 4. 初始化宏
- `ngx_string(text)`：从 C 字符串字面量创建静态 `ngx_str_t`。
- `ngx_null_string`：表示空字符串的初始值。
- `ngx_str_set(str, text)`：用于初始化 `ngx_str_t*` 指针。
- `ngx_str_null(str)`：将 `ngx_str_t*` 设为空。

> ⚠️ 此规范仅适用于 nginx 内部 C 代码，不适用于通用 C 项目。