---
name: Nginx子请求授权机制
description: 配置并使用Nginx的ngx_http_auth_request_module模块，通过向授权服务发起子请求来控制主请求的访问权限。当需要基于外部认证/授权服务（如OAuth、JWT验证或自定义鉴权接口）动态决定是否允许客户端访问特定location时使用此技能。
---

# Nginx子请求授权机制

## 何时使用
- 需要将Nginx作为反向代理，并在转发请求前调用独立的授权服务进行鉴权
- 授权逻辑无法通过auth_basic或auth_jwt等静态机制实现
- 希望根据授权服务返回的HTTP状态码（2xx/401/403）动态控制访问

## 执行步骤

### 1. 启用模块
确保Nginx编译时包含`--with-http_auth_request_module`选项。

### 2. 配置auth_request指令
在目标`location`块中添加：
```nginx
auth_request /auth;
```
- `/auth`为子请求发送的目标URI
- 使用`auth_request off;`可禁用继承的设置

### 3. 处理子请求响应
子请求的HTTP状态码决定主请求结果：
- **2xx**：允许访问，继续处理主请求
- **401**：拒绝访问，返回401，并透传子请求中的`WWW-Authenticate`头
- **403**：拒绝访问，返回403
- **其他状态码**：视为内部错误

### 4. 设置变量（可选）
使用`auth_request_set`提取子请求响应头：
```nginx
auth_request_set $user_id $upstream_http_x_user_id;
```

### 5. 推荐子请求location配置
```nginx
location = /auth {
    internal;
    proxy_pass http://auth-service;
    proxy_pass_request_body off;
    proxy_set_header Content-Length "";
    proxy_set_header X-Original-URI $request_uri;
}
```

### 6. 启用缓存（Nginx ≥ 1.7.3）
配置`proxy_cache`以缓存子请求响应，减少重复鉴权开销。

### 7. 与其他模块协同
通过`satisfy any|all`指令与`allow/deny`、`auth_basic`等组合使用。