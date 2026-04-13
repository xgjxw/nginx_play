# Nginx 学习型游戏 MVP 关卡蓝图

## 1. 章节范围

MVP 只做两章：
- 第一章：请求到来
- 第二章：反向代理

MVP 的目标不是覆盖 Nginx 全量能力，而是先证明玩家能在游戏中真正理解请求处理路径。

## 2. 关卡统一模板

每关都遵循同一骨架：
- 业务背景
- 玩家目标
- 可观察证据
- 可编辑配置块
- 通关条件
- 常见误解
- 复盘重点
- 对应技能来源

## 3. 前 10 关设计

### 关卡 1：欢迎页上线
业务背景：
团队刚把一台测试机交给你，需要确认 Nginx 已正常提供默认站点。

玩家目标：
- 让 `GET /` 返回欢迎页
- 状态码为 `200`

可观察证据：
- 浏览器请求结果
- access log
- 服务状态提示

可编辑配置块：
- `listen`
- `root`
- `index`

通关条件：
- `/` 成功返回默认页
- 不出现 `404`

常见误解：
- 以为只写 `root` 就够了
- 不理解 `index` 的作用

复盘重点：
- 请求如何进入默认 `server`
- 静态文件站点为什么需要 `root` 和 `index`

对应技能来源：
- `nginx-welcome-page-health-check`

### 关卡 2：两个域名，一个站点
业务背景：
产品要求 `www.example.com` 和 `example.com` 都能打开首页。

玩家目标：
- 正确匹配 Host
- 非规范域名重定向到主域名

可观察证据：
- Host 不同的请求结果
- `Location` 响应头
- access log 中的 Host 字段

可编辑配置块：
- `server_name`
- `return`

通关条件：
- `example.com` 返回 `301` 到 `www.example.com`
- `www.example.com` 返回 `200`

常见误解：
- 以为一个 `server` 块能同时完成服务和重定向且无需区分
- 不理解 `301` 与内部转发的差异

复盘重点：
- `server_name` 匹配规则
- 为什么域名规范化要显式重定向

对应技能来源：
- `nginx-domain-redirect-best-practice`
- `nginx-server-names-hash-tuning`

### 关卡 3：谁命中了这个 location
业务背景：
前端页面和后台接口都在同一域名下，当前接口请求返回了错误页面。

玩家目标：
- 让 `/api/users` 命中接口配置
- 让 `/assets/app.js` 继续走静态资源

可观察证据：
- 请求路径追踪
- 命中的 `location`
- 响应体摘要

可编辑配置块：
- `location /`
- `location /api/`

通关条件：
- `/api/users` 返回 API mock 数据
- `/assets/app.js` 返回静态文件

常见误解：
- 以为更短的 `location /` 永远先匹配
- 不理解路径前缀匹配会吞掉子路径

复盘重点：
- `location` 的基础匹配思路
- 为什么请求路径分流是 Nginx 心智模型核心

对应技能来源：
- `nginx-http-request-lifecycle`
- `nginx-http-request-phase-handling`

### 关卡 4：第一个反向代理
业务背景：
首页静态资源已经部署好，但 `/api/` 需要转发到后端服务。

玩家目标：
- 让 `/api/health` 通过 Nginx 访问上游
- 保持首页静态资源不受影响

可观察证据：
- upstream 拓扑图
- 请求路径
- 上游响应和代理响应对比

可编辑配置块：
- `upstream backend`
- `location /api/`
- `proxy_pass`

通关条件：
- `/api/health` 返回上游的 `200`
- `/` 仍然正常打开

常见误解：
- 把所有请求都代理走
- 把 `proxy_pass` 放错块级

复盘重点：
- 静态资源与反向代理可以共存
- `upstream` 和 `proxy_pass` 的职责分离

对应技能来源：
- `nginx-proxy-pass-uri-rewriting`
- `nginx-upstream-load-balancer-implementation`

### 关卡 5：URI 为什么变了
业务背景：
后端只接受 `/users`，但当前 Nginx 转发的是 `/api/users`，导致 `404`。

玩家目标：
- 正确处理 `/api/` 前缀
- 让上游收到预期 URI

可观察证据：
- “进入 Nginx 的 URI” 与 “发给上游的 URI” 对比
- error log 和上游 mock 记录

可编辑配置块：
- `location /api/`
- `proxy_pass`

通关条件：
- `/api/users` 被转发为 `/users`
- 隐藏测试中的 `/api/orders` 也通过

常见误解：
- 不理解 `proxy_pass` 末尾 `/` 会改变 URI 行为
- 以为路径改写由后端自动完成

复盘重点：
- `proxy_pass` URI 重写规则
- 为什么这是新手最常踩的坑

对应技能来源：
- `nginx-proxy-pass-uri-rewriting`

### 关卡 6：真实客户端 IP 去哪了
业务背景：
上游应用日志里只能看到 Nginx 的 IP，业务方无法追踪真实来源。

玩家目标：
- 让上游收到真实客户端 IP 信息
- 不破坏已有代理链

可观察证据：
- 请求头面板
- 上游收到的 `X-Forwarded-For`
- access log 对比

可编辑配置块：
- `proxy_set_header`

通关条件：
- 上游能收到正确的客户端来源链
- 隐藏测试中多级代理场景仍正确

常见误解：
- 把客户端 IP 直接覆盖成固定值
- 混淆 `Host`、`X-Real-IP`、`X-Forwarded-For`

复盘重点：
- 代理环境中“真实来源”的传递方式
- 为什么头部透传是代理配置的基本功

对应技能来源：
- `nginx-proxy-set-header-empty-value-handling`
- `nginx-real-client-ip-rewrite`
- `nginx-proxy-embedded-variables`

### 关卡 7：Basic Auth 挡门
业务背景：
后台管理页暂时不对外开放，需要最小成本加一道认证。

玩家目标：
- 给 `/admin/` 加 Basic Auth
- 普通首页继续公开访问

可观察证据：
- 未带认证头的响应
- 带认证头的响应
- access log 中的状态差异

可编辑配置块：
- `location /admin/`
- `auth_basic`
- `auth_basic_user_file`

通关条件：
- 未授权访问 `/admin/` 返回 `401`
- 正确凭证访问成功
- `/` 不受影响

常见误解：
- 把整个站点都加上认证
- 忘记只在受保护路径启用

复盘重点：
- 最小访问控制的思路
- 路径级权限隔离

对应技能来源：
- `nginx-http-basic-auth-configuration`

### 关卡 8：WebSocket 升级失败
业务背景：
聊天服务通过 `/chat/` 提供 WebSocket，当前握手失败，前端反复重连。

玩家目标：
- 让握手返回 `101 Switching Protocols`
- 保持长连接稳定

可观察证据：
- 握手请求头
- 响应码
- 连接时长指标
- error log

可编辑配置块：
- `proxy_http_version`
- `proxy_set_header Upgrade`
- `proxy_set_header Connection`
- `proxy_read_timeout`

通关条件：
- `101` 成功返回
- 长连接在 60 秒后仍保持

常见误解：
- 只写 `proxy_pass`
- 忘记 `HTTP/1.1`
- `Connection` 写死导致普通请求副作用

复盘重点：
- WebSocket 为什么不是普通 HTTP 代理
- 升级头和连接超时的作用

对应技能来源：
- `nginx-websocket-proxy-configuration`

### 关卡 9：请求太慢还是缓冲方式不对
业务背景：
下载接口对大响应很慢，产品反馈首包时间不稳定。

玩家目标：
- 在两组测试流量下平衡首包延迟和整体吞吐
- 学会识别 buffering 的作用

可观察证据：
- 首字节时间
- 总耗时
- 内存/磁盘缓冲使用提示

可编辑配置块：
- `proxy_buffering`
- `proxy_buffers`
- `proxy_busy_buffers_size`

通关条件：
- 流式接口首包时间低于阈值
- 大文件下载整体时间不过线

常见误解：
- 以为关闭缓冲一定更快
- 不理解不同业务类型的取舍

复盘重点：
- buffering 是性能权衡，不是单向优化
- 业务场景决定配置方向

对应技能来源：
- `nginx-response-buffering-control`

### 关卡 10：第一个缓存策略
业务背景：
商品详情页请求量很高，应用服务器压力过大，但登录态接口不能缓存。

玩家目标：
- 只缓存匿名商品详情
- 跳过带 Cookie 的请求
- 观察缓存命中率提升

可观察证据：
- `MISS` / `HIT` 标记
- 上游请求次数
- 缓存命中率面板

可编辑配置块：
- `proxy_cache_path`
- `proxy_cache`
- `proxy_cache_key`
- `proxy_no_cache`
- `proxy_cache_bypass`

通关条件：
- 匿名请求命中缓存
- 带登录 Cookie 的请求绕过缓存
- 上游压力下降到目标值以下

常见误解：
- 对所有接口一刀切缓存
- 忽略 Cookie、状态码、请求方法对缓存的影响

复盘重点：
- 缓存的价值不是“总是更快”，而是“有条件地减少回源”
- 缓存策略本质上是业务规则

对应技能来源：
- `proxy-cache-core-configuration-and-key-generation`
- `nginx-proxy-cache-path-configuration`

## 4. 关卡评分模型

每关使用四维评分：
- 正确性：功能是否达标
- 稳定性：隐藏用例是否通过
- 性能：延迟、缓存命中、上游压力是否符合目标
- 可维护性：配置是否多余、是否存在明显风险

## 5. 从文档生成关卡素材的规则

### 必提取字段
- `name`
- `description`
- 使用场景
- 最小配置片段
- 注意事项
- 版本限制

### 关卡素材映射
- 使用场景 -> 业务背景
- 最小配置片段 -> 标准答案骨架
- 注意事项 -> 常见误解和隐藏测试
- 版本限制 -> 关卡环境约束

## 6. MVP 之后的扩展顺序

优先级 1：
- gzip
- real IP 深化
- reload / restart
- error log 排障关

优先级 2：
- FastCGI cache
- JWT
- TLS
- rate limit

优先级 3：
- upstream 负载均衡
- 健康检查
- 动态上游
- 子请求鉴权
