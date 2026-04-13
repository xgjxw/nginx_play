---
name: uWSGI缓存有效性与过期策略
description: 定义uWSGI响应的缓存有效期规则，适用于需要控制HTTP响应缓存行为的场景。当需配置基于状态码、响应头或自定义条件的缓存时间，并处理Set-Cookie/Vary等排除逻辑时使用此技能。
---

# uWSGI缓存有效性与过期策略

## 何时使用
- 需要为uWSGI后端响应设置基于HTTP状态码的缓存有效期
- 响应中包含`X-Accel-Expires`、`Expires`或`Cache-Control`头，需明确其与配置指令的优先级关系
- 需排除含`Set-Cookie`或`Vary: *`的响应不被缓存
- 需结合`uwsgi_no_cache`或`uwsgi_cache_bypass`实现精细缓存控制

## 核心操作步骤

1. **配置基础缓存有效期**
   - 使用`uwsgi_cache_valid [code ...] time;`指令
   - 示例：
     - `uwsgi_cache_valid 200 302 10m;` → 仅缓存200/302响应10分钟
     - `uwsgi_cache_valid 5m;` → 默认仅缓存200/301/302响应5分钟
     - `uwsgi_cache_valid any 1m;` → 缓存所有响应1分钟

2. **处理响应头优先级**
   - 若响应含`X-Accel-Expires`：
     - 数值（秒）表示缓存时长（0=禁用缓存）
     - `@`前缀后接Unix时间戳表示绝对过期时间
   - 若无`X-Accel-Expires`，则使用`Expires`或`Cache-Control`头

3. **应用缓存排除规则**
   - 自动跳过以下响应的缓存：
     - 包含`Set-Cookie`头
     - 包含`Vary: *`（Nginx ≥1.7.7）
     - 包含`Vary: <field>`时，缓存键会包含请求头`<field>`的值

4. **覆盖默认头处理行为**
   - 使用`uwsgi_ignore_headers`指令忽略特定响应头对缓存的影响

5. **协同缓存旁路机制**
   - 使用`uwsgi_no_cache`定义不存储响应的条件
   - 使用`uwsgi_cache_bypass`定义不读取缓存的条件

6. **处理陈旧响应**
   - 支持`Cache-Control`扩展如`stale-while-revalidate`和`stale-if-error`
   - 注意：这些扩展的优先级低于`uwsgi_cache_valid`指令参数