---
name: nginx-http-variable-system
description: 在 Nginx 模块中注册、访问和操作 HTTP 变量。当需要在运行时动态获取请求上下文信息（如 $uri、$arg_x）或创建自定义变量供配置指令使用时使用本技能。
---

# Nginx HTTP 变量系统操作

## 触发条件
需要在运行时获取或设置 HTTP 变量值时触发变量 API 操作。

## 变量访问方式
### 索引访问（推荐）
- **配置阶段**：`ngx_http_get_variable_index(cf, &name)` 获取索引
- **运行时**：
  - `ngx_http_get_indexed_variable(r, index)`：返回缓存值
  - `ngx_http_get_flushed_variable(r, index)`：刷新非缓存变量

### 名称访问（动态）
- `ngx_http_get_variable(r, name, key)`：适用于 SSI/Perl 等未知名称场景

## 变量值结构
`ngx_http_variable_value_t` 包含：
- `len/data`：值长度和内容
- `valid/not_found/no_cacheable/escape`：状态标志

## 创建自定义变量
1. **注册变量**：`ngx_http_add_variable(cf, &name, flags)`
   - `NGX_HTTP_VAR_CHANGEABLE`：允许重定义（如 `set` 指令）
   - `NGX_HTTP_VAR_NOCACHEABLE`：禁用缓存（如 `$time_local`）
   - `NGX_HTTP_VAR_NOHASH`：仅索引访问
   - `NGX_HTTP_VAR_PREFIX`：前缀变量（如 `arg_*`）
2. **设置回调**：
   - `get_handler`：分配内存、格式化值、设 `valid=1`
   - `set_handler`：解析输入、更新请求字段（如 `limit_rate`）

## 关键约束
- `NOHASH` 变量只能通过索引访问
- 必须检查 `not_found` 标志判断变量是否存在

## 典型应用场景
- 创建动态配置变量（如 `$my_custom_id`）
- 实现基于请求参数的路由逻辑
- 集成外部数据源到 Nginx 配置