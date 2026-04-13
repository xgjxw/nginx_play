---
name: nginx-welcome-page-health-check
description: 判断HTTP响应是否为标准Nginx默认欢迎页面（包含"Welcome to nginx!"字符串），用于服务可用性探测或配置验证。当需要确认Nginx服务是否正常运行并返回默认欢迎页时使用此技能。
---

# Nginx 欢迎页健康检查

## 适用场景
- 执行服务健康检查时，需确认目标返回的是标准Nginx欢迎页
- 验证Nginx配置是否生效且未被自定义页面覆盖
- 自动化运维脚本中识别默认Nginx实例

## 执行步骤
1. **验证状态码**：确认HTTP响应状态码严格等于 `200`。
2. **检查Content-Type**：确认响应头中 `Content-Type` 字段精确匹配 `text/html`。
3. **匹配响应体**：使用正则表达式（~）检查响应体是否包含字符串 `"Welcome to nginx!"`。
4. **综合判断**：仅当上述三个条件全部满足时，判定为标准Nginx欢迎页，返回 `true`；否则返回 `false`。

## 注意事项
- 此规则**不适用于**非HTML内容或非200状态码的响应。
- 响应体必须包含原始字符串 `"Welcome to nginx!"`，大小写和标点必须完全一致。
- 该技能仅用于识别**默认**Nginx欢迎页，不适用于自定义页面。