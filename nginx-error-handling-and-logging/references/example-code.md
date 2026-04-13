## 示例代码

```c
void ngx_my_kill(ngx_pid_t pid, ngx_log_t *log, int signo) {
    ngx_err_t err;
    if (kill(pid, signo) == -1) {
        err = ngx_errno;
        ngx_log_error(NGX_LOG_ALERT, log, err, "kill(%P, %d) failed", pid, signo);
    }
    if (err == NGX_ESRCH) {
        return 2;  // NGX_ESRCH 表示进程不存在（ESRCH 的 Nginx 封装）
    }
    return 1;
}
```

## 常见错误码映射
- `NGX_ESRCH`: 进程不存在（对应 POSIX `ESRCH`）
- 其他标准错误码通过 `ngx_errno` 自动映射为跨平台形式

## 宏与类型说明
- `ngx_errno`: 跨平台系统错误码获取宏
- `ngx_socket_errno`: 跨平台 socket 错误码获取宏
- `ngx_err_t`: 用于存储错误值的 typedef 类型