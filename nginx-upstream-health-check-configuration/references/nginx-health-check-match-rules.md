# NGINX 健康检查 match 规则详解

## status 规则
- `status 200`：必须精确为 200
- `status ! 500`：不能为 500
- `status 200 204`：必须是 200 或 204
- `status ! 301 302`：不能是 301 或 302
- `status 200-399`：状态码在 200 到 399 范围内
- `status ! 400-599`：状态码不在 400 到 599 范围内
- `status 301-303 307`：支持多值与范围混合

## header 规则
- `header Content-Type = text/html`：值必须精确匹配
- `header Content-Type != text/html`：值不能等于
- `header Connection ~ close`：值需匹配正则表达式
- `header Connection !~ close`：值不得匹配正则表达式
- `header Host`：请求头必须存在
- `header ! X-Accel-Redirect`：请求头必须不存在

## body 规则
- `body ~ "Welcome to nginx!"`：响应正文（前 256KB）需匹配正则
- `body !~ "error"`：响应正文不得匹配正则

## require 规则（NGINX Plus 1.15.9+）
- `require $var1 $var2`：所有指定变量必须非空且不等于 "0"

## 组合逻辑
所有在 match 块中定义的规则必须同时满足，健康检查才视为通过。

## 注意事项
- 健康检查请求中大多数变量为空
- 同一组可配置多个 health_check，任一失败即标记为不健康
- 默认检查 URI 为 `/`，方法为 GET