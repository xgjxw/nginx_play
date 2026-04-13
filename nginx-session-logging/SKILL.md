---
name: Nginx 会话日志配置
description: 配置基于会话的聚合日志（而非每请求日志），适用于需要跟踪用户会话行为（如电商、登录流）的场景。需启用 ngx_http_session_log_module。
---

# Nginx 会话日志配置

## 适用场景
- 需要记录整个用户会话（多请求聚合）而非单个请求
- 已启用 `ngx_http_session_log_module` 模块
- 会话由 Cookie 或其他标识符跟踪

## 配置步骤

### 1. 定义日志格式
```nginx
session_log_format combined '$remote_addr - $session_id [$time_local] ...';
```

### 2. 设置日志区域
```nginx
session_log_zone /var/log/nginx/sessions.log zone=sessions:1m timeout=30s id=$cookie_JSESSIONID;
```
- `timeout`：会话超时（默认 30 秒）
- `id`：会话 ID（如 Cookie 值），可含变量
- `md5`：若 `id` 无效，从此值计算哈希

### 3. 启用日志
```nginx
session_log sessions;  # 使用定义的名称
```

## 日志内容
- `$body_bytes_sent`：会话中所有请求的累计字节数
- 其他变量：取自会话中第一个请求

## 验证
- 检查日志文件是否按会话聚合
- 确保超时后会话被正确写入

> 注意：会话活动判定基于 `timeout`；超时后写入日志。