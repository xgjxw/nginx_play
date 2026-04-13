---
name: nginx-upstream-health-check-configuration
description: 配置和管理 NGINX Plus 商业模块 ngx_http_upstream_hc_module 的 HTTP 上游服务器健康检查机制。当用户需要在 location 块中启用对共享内存中的 upstream server group 的主动健康检查，并自定义检查频率、失败/恢复阈值、请求 URI、端口或响应验证规则时使用此技能。
---

# NGINX 上游健康检查配置

## 适用条件
- 必须使用 NGINX Plus（商业订阅）
- upstream 块中已通过 `zone` 指令声明共享内存区域
- 在 `location` 块中配置 `health_check` 指令
- 仅适用于 HTTP upstream，不适用于 stream upstream

## 核心配置步骤

1. **定义共享内存 upstream**：在 `upstream` 块中使用 `zone` 指令分配共享内存。
   ```nginx
   upstream my_backend {
       zone my_backend 64k;
       server 10.0.0.1:80;
       server 10.0.0.2:80;
   }
   ```

2. **在 location 中启用健康检查**：使用 `health_check` 指令并指定参数。
   ```nginx
   location / {
       proxy_pass http://my_backend;
       health_check interval=5s fails=2 passes=3 uri=/health port=8080 match=my_match;
   }
   ```

3. **（可选）定义 match 块进行高级响应验证**：在 `http` 上下文中定义 `match` 块，组合状态码、头部和正文规则。
   ```nginx
   match my_match {
       status 200-399;
       header Content-Type = application/json;
       body ~ "ok";
   }
   ```

4. **理解服务器状态行为**：
   - 默认单次失败即标记为不健康（`fails=1`）
   - 默认单次成功即恢复健康（`passes=1`）
   - 使用 `mandatory` 参数可使服务器初始处于“检查中”状态，期间不接收请求
   - 不健康或“检查中”的服务器不会被代理请求

> 提示：若需详细参数说明、match 规则语法或配置示例，请参考 `references/nginx-health-check-match-rules.md`。