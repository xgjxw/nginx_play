---
name: nginx-event-loop-processing
description: 处理Nginx worker或helper进程中的事件循环，包括I/O事件、超时事件和已发布事件的调度与执行。当用户需要理解、调试或优化Nginx异步事件处理机制（如epoll/kqueue下的事件调度流程）时使用本技能。
---

# Nginx事件循环处理

## 适用对象
- Nginx worker进程
- Nginx helper进程

> **注意**：不适用于master进程，因其主要等待信号而非参与事件循环。

## 触发条件
当Nginx worker或helper进程运行时，自动进入事件循环处理流程。

## 执行步骤

1. **进入事件循环**：在`ngx_process_events_and_timers()`函数中持续执行，直至进程退出。

2. **查找最近超时**：调用`ngx_event_find_timer()`，从计时器红黑树最左节点获取下一个即将到期的超时时间（毫秒）。

3. **处理I/O事件**：
   - 调用底层事件通知机制（如`ngx_epoll_process_events()`）。
   - 等待I/O事件发生，但不超过上一步计算出的超时时间。
   - 事件发生时，设置`ready`标志并立即调用对应的事件处理程序。
   - 所有I/O事件以Edge-Triggered（ET）模式运行，即使底层为Level-Triggered（LT）。

4. **处理超时事件**：
   - 调用`ngx_event_expire_timers()`。
   - 从计时器树最左节点开始向右遍历，对每个已过期事件：
     - 设置`timedout`标志；
     - 清除`timer_set`标志；
     - 调用其事件处理程序。

5. **处理已发布事件**：
   - 调用`ngx_event_process_posted()`。
   - 循环从发布队列头部取出事件并执行其处理程序，直到队列为空。

6. **事件注册维护**：
   - 在处理I/O通知或调用I/O函数后，必须调用`ngx_handle_read_event()`或`ngx_handle_write_event()`以正确更新事件状态。

7. **信号处理**：
   - 信号处理程序仅设置全局变量（如`ngx_quit`、`ngx_reconfigure`等）。
   - 实际信号逻辑在`ngx_process_events_and_timers()`返回后检查并执行。

## 关键事件标志
- `ready`：表示事件已收到I/O通知。
- `timedout`：表示事件因超时被触发。
- `active`：表示事件已注册到事件通知系统中。

## 使用场景
- 分析Nginx高并发性能瓶颈
- 调试连接超时或请求卡顿问题
- 开发Nginx模块时正确集成事件处理逻辑
- 理解Nginx异步非阻塞架构核心机制