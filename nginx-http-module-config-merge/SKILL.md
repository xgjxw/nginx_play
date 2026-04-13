---
name: nginx-http-module-config-merge
description: 配置并合并 Nginx HTTP 模块的三层配置结构（main、server、location），适用于开发或调试 NGX_HTTP_MODULE 类型模块时处理配置创建、继承与默认值填充。当解析 nginx.conf 并遇到 HTTP 模块指令，需初始化或合并配置结构体时使用本技能。
---

# Nginx HTTP 模块配置体系与合并机制

## 适用场景
- 开发自定义 NGX_HTTP_MODULE 类型模块
- 调试配置继承行为（如 location 块未显式设置参数时如何继承 server 或 main 级配置）
- 实现 create_*_conf 和 merge_*_conf 回调函数

## 核心流程

### 1. 配置层级划分
- **主要配置（main）**：作用于整个 `http` 块，作为全局默认值。
- **服务器配置（server）**：作用于单个 `server` 块，可覆盖 main 配置。
- **位置配置（location）**：作用于 `location`、`if` 或 `limit_except` 块，可覆盖 server/main 配置。

### 2. 配置创建
- 在配置解析阶段，Nginx 调用模块注册的 `create_main_conf`、`create_srv_conf`、`create_loc_conf` 函数。
- 使用 `NGX_CONF_UNSET_*` 宏（如 `NGX_CONF_UNSET_UINT`）初始化字段，表示“未显式设置”。

### 3. 配置合并
- 调用 `merge_srv_conf` 将 server 配置与 main 合并。
- 调用 `merge_loc_conf` 将 location 配置依次与 server、main 合并。
- 使用合并宏（如 `ngx_conf_merge_uint_value(conf->foo, prev->foo, 1)`）：若 `conf->foo` 为 unset，则从 `prev->foo` 继承；若仍为 unset，则使用默认值（如 1）。

### 4. 运行时访问
- 使用 `ngx_http_get_module_main_conf(r, module)`、`ngx_http_get_module_srv_conf(r, module)` 或 `ngx_http_get_module_loc_conf(r, module)` 获取对应层级配置。
- 注意：main 配置在运行时不变；server 配置在虚拟主机选定后固定；location 配置可能因重写或内部重定向而变更。

## 关键约束
- 仅适用于 `NGX_HTTP_MODULE` 类型模块。
- 必须正确实现 create 和 merge 回调函数，否则配置行为不可预测。
- 所有未设置字段必须使用 `NGX_CONF_UNSET_*` 初始化，否则合并逻辑失效。