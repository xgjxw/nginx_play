---
name: Nginx proxy_set_header 空值处理
description: 控制 Nginx 在反向代理时是否传递特定 HTTP 请求头。当你需要主动移除某个客户端请求头（如 Accept-Encoding）以防止其透传到后端服务时使用本技能。
---

# Nginx proxy_set_header 空值处理

## 使用场景
当你希望阻止某些 HTTP 请求头从客户端传递到上游服务器（例如禁用压缩、移除敏感头或简化调试）时，可将 `proxy_set_header` 的值设为空字符串。

## 操作步骤
1. **识别要移除的请求头字段**（如 `Accept-Encoding`, `User-Agent` 等）。

2. **在 location 或 server 块中添加指令**：
   ```nginx
   proxy_set_header Header-Name "";
   ```
   示例：
   ```nginx
   proxy_set_header Accept-Encoding "";
   ```

3. **验证行为**：
   - 此配置会使 Nginx **完全省略**该头字段，不会发送给后端
   - 仅对字面量空字符串 `""` 生效，变量展开后为空的情况需额外处理

> 注意：未设置 `proxy_set_header` 时，Nginx 默认会传递部分标准头；显式设为空字符串是主动删除头的唯一方式。