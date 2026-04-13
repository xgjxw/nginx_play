---
name: nginx连接管理与重用机制
description: 管理nginx worker进程中的连接分配与重用，确保在worker_connections限制下高效处理客户端请求。当连接池耗尽且需要新连接时触发此技能，适用于HTTP或Stream模块中需动态复用空闲连接的场景。
---

# nginx连接管理与重用机制

## 何时使用
- 当nginx worker进程的活跃连接数达到`worker_connections`上限，但仍需接受新连接时
- 在HTTP客户端尚未发送完整请求前，希望将连接标记为可重用以提升资源利用率
- 开发或调试基于nginx的模块，需手动获取或释放连接结构

## 核心操作流程

### 1. 连接初始化
- 每个worker进程启动时，根据`worker_connections`指令预先创建固定数量的`ngx_connection_t`结构，并存入`free_connections`链表

### 2. 获取连接
- 调用`ngx_get_connection(s, log)`获取连接结构，其中`s`为套接字描述符
- 若`free_connections`为空，则自动触发连接重用机制

### 3. 启用连接重用
- 对暂不需要立即关闭但可被回收的连接（如等待首字节的HTTP连接），调用：
  ```c
  ngx_reusable_connection(c, 1);
  ```
  此操作将连接插入`reusable_connections_queue`

### 4. 触发连接回收
- 当`ngx_get_connection()`发现无空闲连接时，调用`ngx_drain_connections()`
- `ngx_drain_connections()`从`reusable_connections_queue`中取出若干连接并执行以下操作：
  - 设置`c->close = 1`
  - 调用该连接的读事件处理函数（通常由模块实现）
  - 读处理函数应调用`ngx_close_connection(c)`释放连接
  - 最终调用`ngx_reusable_connection(c, 0)`清除重用标志

### 5. SSL连接处理
- 若连接启用了SSL，`c->ssl`指向`ngx_ssl_connection_t`结构
- `c->recv`/`c->send`等I/O处理程序自动替换为SSL封装函数，无需额外逻辑

## 关键变量说明
- `fd` (`ngx_socket_t`)：底层套接字描述符
- `data` (`void*`)：连接上下文，通常指向`ngx_http_request_t`或stream会话
- `reusable` (`unsigned`)：非零表示连接处于可重用队列
- `close` (`unsigned`)：非零表示连接应被关闭

> 注意：此机制仅适用于worker进程，master进程不参与连接管理。