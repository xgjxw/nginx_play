---
name: nginx-ssi-command-processing
description: 处理 Nginx 中启用 SSI（Server-Side Includes）后对 HTML 或文本响应内容中 <!-- command ... --> 指令的解析与执行。当响应体包含 SSI 指令、SSI 功能已启用且 MIME 类型匹配 ssi_types 时使用本技能。
---

# Nginx SSI 指令处理

## 启用条件
- 确保在 http、server、location 或 if in location 上下文中配置 `ssi on;`（默认为 off）。
- 响应内容的 MIME 类型必须匹配 `ssi_types` 指令定义的类型（默认为 text/html；可设为 '*' 匹配任意类型，Nginx 0.8.29+ 支持）。

## 指令通用格式
所有 SSI 指令采用如下格式：
```html
<!-- command parameter1=value1 parameter2=value2 ... -->
```

## 支持的核心命令及执行逻辑

### block / endblock
- 定义可在 `include` 中作为 stub 使用的命名块。
- 必须指定 `name` 参数。

### config
- 设置全局行为：
  - `errmsg`：错误提示文本（默认为 `[an error occurred while processing the directive]`）。
  - `timefmt`：日期格式（默认为 `%A, %d-%b-%Y %H:%M:%S %Z`；使用 `%s` 输出 Unix 时间戳）。

### echo
- 输出变量值：
  - `var`：变量名（如 `$date_local`）。
  - `encoding`：输出编码方式（`none`/`url`/`entity`，默认 `entity`）。
  - `default`：变量未定义时的回退值。

### if / elif / else / endif
- 条件判断（仅支持一级嵌套）：
  - 变量存在性：`<!-- if expr="$name" -->`
  - 字符串比较：`<!-- if expr="$name = text" -->` 或 `!=`
  - 正则匹配：`<!-- if expr="$name = /text/" -->`，支持命名捕获组（如 `(?P<domain>.+)`），可通过 `$1` 或 `$domain` 引用。

### include
- 嵌入外部内容：
  - `file`：本地文件路径。
  - `virtual`：远程请求路径（发起子请求）。
  - `stub`：指定 block 名称，用于请求失败或响应为空时的备用内容。
  - `wait=yes`：等待子请求完成后再继续处理（默认异步）。
  - `set`（Nginx 1.13.10+）：将响应体写入变量（受 `subrequest_output_buffer_size` 限制）。

### set
- 设置变量：
  - `var`：目标变量名。
  - `value`：值（其中的变量会被替换）。

## 错误与性能控制
- 启用 `ssi_silent_errors on;` 可抑制错误字符串输出。
- `ssi_last_modified on;`（1.5.1+）保留原始 `Last-Modified` 响应头。
- `ssi_min_file_chunk` 控制磁盘响应最小块大小（默认 1k）。
- `ssi_value_length` 限制 SSI 参数值最大长度（默认 256 字节）。

## 内置变量
- `$date_local`：本地时间。
- `$date_gmt`：GMT 时间。
- 格式由最近的 `config timefmt` 指令决定。

> 注意：SSI 仅支持有限命令集，且条件嵌套深度不得超过一级。