---
name: nginx-js-module-integration
description: 在 Nginx 配置中集成 ngx_http_js_module 模块，通过 njs（JavaScript 子集）函数动态处理 HTTP 请求或计算变量值。当 location 块使用 js_content 指令或配置中使用 js_set 定义变量时触发此技能。
---

# Nginx JavaScript 模块集成

## 何时使用
- 需要在 Nginx 中执行轻量级 JavaScript 逻辑（如动态响应生成、请求元数据处理）
- 配置 location 使用 `js_content` 替代传统处理器（如 proxy_pass）
- 需要通过 `js_set` 动态计算变量值（惰性求值）

## 前提条件
1. 确保 ngx_http_js_module 已通过 `load_module` 加载
2. 在 http 块中使用 `js_include` 指定包含 njs 函数的脚本文件
3. 确认 Nginx 版本支持该模块（默认未构建，需手动安装）

## 核心指令配置
1. **全局脚本引入**：在 `http` 块中添加 `js_include /path/to/script.js;`
2. **变量定义**：使用 `js_set $variable_name function_name;` 声明由 njs 函数计算的变量
3. **内容处理器**：在 `location` 块中使用 `js_content function_name;` 将响应生成委托给 njs 函数
4. **模块路径（≥0.3.0）**：通过 `js_path /additional/module/path;` 扩展 njs 模块搜索路径

## njs 函数开发要点
- 每个函数接收唯一的 `r` 参数（request 对象）
- 使用 `r.return(status, body)` 或组合 `r.sendHeader()` + `r.send()` + `r.finish()` 构建响应
- 变量函数必须返回字符串值；内容处理器函数不返回值，直接控制响应
- 通过 `r.log()` 记录调试信息

> 注意：`js_content` 处理器完全接管响应流程，不会执行 proxy_pass、root 等其他 content handler。