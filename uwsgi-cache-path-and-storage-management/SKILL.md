---
name: uWSGI缓存路径与存储管理
description: 配置uWSGI响应的持久化缓存存储策略，包括缓存目录结构、共享内存区域、过期清理机制及临时文件处理。当需要为uWSGI设置高效、可扩展的响应缓存系统时使用此技能。
---

# uWSGI缓存路径与存储管理

## 适用场景
- 需要将uWSGI响应结果持久化缓存以提升性能
- 需配置缓存文件系统的目录层级、内存元数据区域及自动清理策略
- 在http上下文中启用uWSGI缓存功能

## 前提条件
- 必须在http上下文中配置
- 必须指定`keys_zone`参数

## 核心配置步骤

### 1. 基本语法
使用`uwsgi_cache_path`指令定义缓存存储：
```
uwsgi_cache_path path [levels=levels] [use_temp_path=on|off] keys_zone=name:size [inactive=time] [max_size=size] ...
```

### 2. 设置缓存目录结构
- 缓存文件名基于`cache_key`的MD5十六进制值生成
- 使用`levels`参数定义1–3级子目录（每级1或2位十六进制字符）
  - 示例：`levels=1:2` → `/path/c/29/b7f54b...`

### 3. 配置临时文件处理
- 默认先写入临时文件再重命名至缓存目录
- `use_temp_path=on`（默认）：使用`uwsgi_temp_path`指定的临时目录
- `use_temp_path=off`：直接在缓存目录创建临时文件
- **建议**：缓存目录与临时目录位于同一文件系统，避免跨文件系统复制

### 4. 定义共享内存区域（keys_zone）
- 存储活跃缓存键及其元数据
- 格式：`keys_zone=name:size`（如`one:10m`）
- 内存估算：1MB约支持8000个键（开源版）或4000个键（商业版）

### 5. 配置过期与自动清理
- `inactive=time`：未访问缓存项在此时间后标记为可删除（默认10分钟）
- `max_size=size`：触发LRU清理机制
  - 由`cache manager`进程执行
  - 每次迭代最多删除`manager_files`项（默认100）
  - 单次迭代不超过`manager_threshold`（默认200ms）
  - 迭代间隔为`manager_sleep`（默认50ms）

### 6. 启用缓存预加载（可选）
- uWSGI启动1分钟后激活`cache loader`进程
- 加载行为受`loader_files`/`loader_threshold`/`loader_sleep`控制

### 7. 商业版扩展功能（如purger）
- `purger=on`：启用通配符缓存清除进程（仅限付费版本）
- 清除行为由`purger_files`/`purger_threshold`/`purger_sleep`参数调节

> **注意**：uWSGI 1.7.3/1.7.7/1.11.10版本变更了缓存头格式，升级后旧缓存将失效，需清空缓存目录。