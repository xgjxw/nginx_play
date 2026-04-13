---
name: nginx-error-log-configuration
description: 配置 Nginx 的 error_log 指令以控制日志输出目标和日志级别。当需要调整 Nginx 错误日志的详细程度、输出位置（如文件、stderr、syslog 或内存缓冲区）或启用调试日志时使用此技能。
---

# Nginx 错误日志配置

## 何时使用
- 需要自定义 Nginx 错误日志的存储路径或输出方式
- 需要提高或降低日志详细程度（例如启用 debug 级别用于排错）
- 在不同配置层级（main、http、server、location、mail、stream）分别设置日志行为
- 使用多日志目标记录不同级别的信息（Nginx 1.5.2+）

## 如何执行
1. **基本语法**：`error_log file [level];`
2. **指定日志目标（file）**：
   - 文件路径：`/var/log/nginx/error.log`
   - 标准错误：`stderr`
   - Syslog：`syslog:server=192.168.1.1`
   - 内存缓冲区（1.7.11+）：`memory:32m`
3. **设置日志级别（level）**（按严重性从低到高）：
   - `debug`, `info`, `notice`, `warn`, `error`, `crit`, `alert`, `emerg`
   - 设置某一级别将记录该级别及更严重的日志
   - 默认级别为 `error`；若省略 level，等同于使用 `error`
4. **启用 debug 日志**：
   - 必须使用 `--with-debug` 编译选项构建 Nginx
   - 否则 `debug` 级别无效
5. **多日志支持**（1.5.2+）：在同一配置层级可多次使用 `error_log` 指令
6. **配置层级支持**：
   - `stream` 块从 1.7.11 开始支持
   - `mail` 块从 1.9.0 开始支持
7. **默认值**：`logs/error.log error`

> 注意：过度使用 `debug` 级别会显著增加 I/O 负载，仅在必要时启用。