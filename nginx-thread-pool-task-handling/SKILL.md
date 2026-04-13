---
name: nginx-thread-pool-task-handling
description: 在Nginx中使用线程池处理阻塞I/O操作或同步库调用，避免阻塞事件循环。当需要执行可能阻塞工作进程的任务（如文件I/O）时使用此技能。
---

# Nginx线程池任务处理机制

## 何时使用

- 需要执行**阻塞I/O操作**（如磁盘读写）
- 需要调用**同步库函数**，且无法改写为异步形式
- 已在Nginx配置中**启用线程池**
- **不能替代异步事件模型**，仅作为辅助手段卸载阻塞任务

## 执行步骤

1. **获取线程池引用**：调用 `ngx_thread_pool_add(cf, name)` 获取指定名称的线程池（若不存在则创建）。
2. **分配任务结构**：使用 `ngx_thread_task_alloc(pool, size)` 分配 `ngx_thread_task_s` 结构及上下文数据。
3. **设置任务处理器**：
   - 设置 `task->handler` 为在线程中执行的函数
   - 设置 `task->event.handler` 为任务完成后的回调（在Nginx事件循环中执行）
   - 设置 `task->ctx` 为传递给上述两个函数的上下文指针
4. **提交任务**：调用 `ngx_thread_task_post(tp, task)` 将任务加入线程池队列。
5. **任务执行与回调**：
   - 线程池中的工作线程执行 `handler`
   - 完成后，Nginx事件循环自动调用 `event.handler`

## 关键约束

- 线程池在Nginx启动时创建，包含固定数量线程
- 可配置多个线程池用于不同I/O目的（如不同磁盘）
- 禁止在线程中直接操作Nginx核心数据结构（需通过完成回调安全交互）

## 同步原语支持

Nginx提供线程安全的同步工具：
- `ngx_thread_mutex_t`（互斥锁）
- `ngx_thread_cond_t`（条件变量）
及其配套初始化、加锁、等待等操作函数，用于线程间协调。