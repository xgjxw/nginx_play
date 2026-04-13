---
name: nginx-thread-pool-io-optimization
description: 配置 nginx 线程池以实现非阻塞文件 I/O，适用于大文件传输或高并发静态资源服务场景。当使用 aio 指令且需要避免 I/O 阻塞工作进程时使用此技能。
---

# Nginx 线程池与异步 I/O 优化

## 何时使用
- 服务大量大文件（如视频、镜像、日志）
- 启用了 `aio` 指令但观察到工作进程因文件读取而阻塞
- 使用 `sendfile` 或类似操作导致事件循环延迟

## 核心配置步骤

### 1. 定义线程池
- 使用 `thread_pool` 指令创建工作线程池（nginx 1.7.11+）
- 语法：`thread_pool name threads=number [max_queue=number];`
- 默认线程池：`thread_pool default threads=32 max_queue=65536;`

### 2. 在 location 中启用线程化 AIO
- 示例：
  ```nginx
  location /static/ {
      aio threads=static;
  }
  ```
- 可指定不同线程池用于不同用途（如 `static`、`disk`）

### 3. 控制异步 I/O 并发量
- 使用 `worker_aio_requests` 限制单个工作进程的未完成异步 I/O 数量
- 默认值为 32，可根据负载调整
- 示例：`worker_aio_requests 64;`

### 4. 监控队列状态
- 当线程池任务队列满（达到 `max_queue`）时，新请求将立即失败
- 应根据实际负载合理设置 `max_queue`，避免资源耗尽

> 注意：线程池仅对特定文件操作（如 `read`、`sendfile`）生效，不适用于所有 I/O 类型。