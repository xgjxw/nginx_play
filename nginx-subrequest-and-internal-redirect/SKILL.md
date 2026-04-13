---
name: Nginx子请求与内部重定向机制
description: 在Nginx模块开发或高级配置中，创建子请求以嵌入其他资源输出，或执行内部重定向以改变请求处理路径。当需要在不暴露给客户端的情况下复用location逻辑、实现SSI包含、或动态切换处理流程时使用此技能。
---

# Nginx子请求与内部重定向机制

## 何时使用
- 需要在当前请求中嵌入另一个location的输出（如SSI、ESI场景）
- 需要根据运行时条件将请求透明地重定向到另一个内部location（如错误处理、路由重写）
- 开发Nginx C模块时需操作请求生命周期

## 执行步骤

### 1. 创建子请求
调用C API：
```c
ngx_http_subrequest(r, uri, args, &sr, ps, flags);
```
关键参数：
- `flags`：常用`NGX_HTTP_SUBREQUEST_IN_MEMORY`（内存缓冲输出）或`NGX_HTTP_SUBREQUEST_CLONE`

子请求特性：
- 共享父请求的客户端输入数据
- 输出头被忽略，由`postponed_filter`按序合并
- 从`NGX_HTTP_SERVER_REWRITE_PHASE`开始处理
- 激活顺序由Nginx自动管理

### 2. 执行内部重定向
#### URI重定向
```c
ngx_http_internal_redirect(r, uri, args);
```
- 修改请求URI
- 返回`NGX_HTTP_SERVER_REWRITE_PHASE`
- 在`FIND_CONFIG_PHASE`重新匹配location

#### 命名location重定向
```c
ngx_http_named_location(r, name);
```
- 重定向到`@name`形式的命名location
- 进入`NGX_HTTP_REWRITE_PHASE`

### 3. 注意事项
- 子请求**不能读取客户端请求体**
- 内部重定向会**清除请求ctx上下文**
- 重定向后必须调用`ngx_http_finalize_request(r, NGX_DONE)`平衡引用计数
- 重定向后的请求自动标记`internal=1`，可访问`internal` location