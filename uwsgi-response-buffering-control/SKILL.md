---
name: uWSGI响应缓冲机制控制
description: 控制Nginx在通过uWSGI代理时是否对后端响应进行内存或磁盘缓冲。当需要优化响应延迟与吞吐量之间的权衡（例如流式传输大文件或实时数据）时使用此技能。
---

# uWSGI响应缓冲机制控制

## 何时使用
- 需要决定uWSGI响应是先完整缓存再发送，还是边接收边转发给客户端
- 调整Nginx与uWSGI之间的性能行为（如降低首字节时间或提升高并发吞吐）
- 处理大响应体（如文件下载、视频流）时避免内存溢出或临时文件写入

## 如何执行

### 1. 设置缓冲开关
在Nginx配置中使用：
```nginx
uwsgi_buffering on | off;
```
- 默认为 `on`（启用缓冲）
- 必须已配置 `uwsgi_pass`

### 2. 启用缓冲（on）的行为
- Nginx尽快从uWSGI读取完整响应
- 响应先存入由 `uwsgi_buffer_size` 和 `uwsgi_buffers` 定义的内存缓冲区
- 若超出内存容量，溢出部分写入临时文件（受 `uwsgi_max_temp_file_size` 和 `uwsgi_temp_file_write_size` 控制）
- 设置 `uwsgi_max_temp_file_size 0;` 可禁用临时文件写入

### 3. 禁用缓冲（off）的行为
- 响应数据一到达即同步转发给客户端
- Nginx不等待完整响应
- 单次接收数据大小受 `uwsgi_buffer_size` 限制

### 4. 动态覆盖
- uWSGI应用可在响应头中添加 `X-Accel-Buffering: yes|no` 动态控制缓冲行为
- 使用 `uwsgi_ignore_headers X-Accel-Buffering;` 可禁用该头的处理

> 注意：所有指令前缀为 `uwsgi_`，文档中可能出现拼写错误（如 uwsgj），请以正确拼写为准。