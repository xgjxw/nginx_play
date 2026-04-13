---
name: Nginx 域名重定向最佳实践
description: 正确配置 Nginx 将非规范域名（如 example.org）永久重定向到主域名（如 www.example.org），适用于需要统一入口域名、避免重复内容或提升 SEO 的场景。当需处理多个域名或捕获非法 Host 请求时，应使用独立 server 块而非 if 判断逻辑。
---

# Nginx 域名重定向最佳实践

## 何时使用
- 需将裸域名（如 example.org）重定向至带 www 的主域名（如 www.example.org）
- 需将多个合法域名之外的所有请求统一重定向到规范域名
- 使用 Nginx 作为 Web 服务器且希望遵循官方推荐的高效、清晰配置方式

## 如何执行
1. **禁止在单个 server 块中使用 `if ($http_host = ...)` 进行重定向**：该方法错误、低效且不符合 Nginx 设计哲学。

2. **为每个非规范域名创建独立的 server 块**：
   ```nginx
   server {
       listen 80;
       server_name example.org;
       return 301 http://www.example.org$request_uri;
   }
   ```

3. **为主域名配置单独的 server 块处理正常流量**：
   ```nginx
   server {
       listen 80;
       server_name www.example.org;
       # 正常站点配置
   }
   ```

4. **处理“其他所有域名”请求**：
   - 明确定义合法域名列表
   - 使用 `default_server` 捕获其余请求并重定向：
     ```nginx
     server {
         listen 80 default_server;
         server_name _;
         return 301 http://example.com$request_uri;
     }
     ```

5. **旧版本兼容（Nginx < 0.9.1）**：若不支持 `return` 指令，改用 `rewrite`：
   ```nginx
   rewrite ^ http://www.example.org$request_uri?;
   ```

> 提示：此方法利用 Nginx 的 `server_name` 匹配机制，在配置加载阶段完成路由决策，比运行时判断更高效、可靠且符合 HTTP 规范。