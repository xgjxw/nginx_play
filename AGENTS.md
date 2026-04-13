# Nginx 中文文档技能合集

## 项目概述

本仓库是 Nginx 核心技能的中文文档合集，源自《Nginx 中文文档》书籍。全面覆盖 Nginx 的核心配置、性能调优、模块开发、安全控制及高级代理功能，共包含 **80+ 项关键技能**。

### 技术领域覆盖

- **HTTP/HTTPS/WebSocket/gRPC 代理**
- **缓存机制**（FastCGI、Proxy、SCGI、uWSGI）
- **身份认证**（Basic Auth、JWT、OAuth）
- **动态上游管理**
- **内存与连接优化**
- **日志与错误处理**
- **第三方模块集成**（njs、XSLT、图像处理）
- **Nginx Plus 商业版特性**

### 目标用户

- 系统工程师
- DevOps 工程师
- Web 架构师
- Nginx 模块开发者

## 目录结构

```
├── index.md                          # 技能索引与导航
├── AGENTS.md                         # 本文件
├── <skill-name>/                     # 每个技能独立目录
│   ├── SKILL.md                      # 技能主文档
│   └── references/                   # 可选：补充参考文档
│       └── *.md
```

### 文档规范

每个 `SKILL.md` 文件遵循统一格式：

```yaml
---
name: 技能名称
description: 简要描述与触发条件
---

# 详细内容
## 何时使用 / 适用条件
## 核心操作步骤
## 配置示例
## 注意事项
```

## 技能分类索引

### 基础配置与部署
| 技能 | 用途 |
|------|------|
| `nginx-welcome-page-health-check` | 验证 Nginx 默认欢迎页 |
| `nginx-source-build-configuration` | 源码编译参数配置 |
| `nginx-process-control-and-config-reload` | 进程控制与配置重载 |
| `nginx-error-log-configuration` | 错误日志配置 |
| `nginx-c-data-type-conventions` | C 数据类型规范 |
| `nginx-module-coding-standards` | 模块编码标准 |
| `nginx-code-contribution-guidelines` | 代码贡献指南 |

### 性能调优与资源管理
| 技能 | 用途 |
|------|------|
| `nginx-connection-concurrency-tuning` | 连接并发调优 |
| `nginx-thread-pool-io-optimization` | 线程池 I/O 优化 |
| `nginx-thread-pool-task-handling` | 线程池任务处理 |
| `nginx-memory-management-pool-and-shared-memory` | 内存管理 |
| `nginx-response-buffering-control` | 响应缓冲控制 |
| `nginx-event-loop-processing` | 事件循环处理 |

### 缓存机制
| 技能 | 用途 |
|------|------|
| `fastcgi-cache-configuration-and-lifecycle` | FastCGI 缓存配置 |
| `fastcgi-cache-control-and-invalidation` | FastCGI 缓存控制 |
| `proxy-cache-core-configuration-and-key-generation` | 代理缓存核心配置 |
| `nginx-proxy-cache-path-configuration` | 代理缓存路径配置 |
| `nginx-proxy-store-static-caching` | 静态文件缓存 |
| `nginx-response-slice-configuration` | 响应切片缓存 |

### 代理与上游管理
| 技能 | 用途 |
|------|------|
| `nginx-proxy-pass-uri-rewriting` | proxy_pass URI 重写 |
| `nginx-proxy-set-header-empty-value-handling` | 请求头传递控制 |
| `nginx-upstream-load-balancer-implementation` | 负载均衡器实现 |
| `nginx-upstream-health-check` | 上游健康检查判断 |
| `nginx-upstream-health-check-configuration` | 健康检查配置（Plus） |
| `nginx-upstream-dynamic-configuration` | 动态上游配置（Plus） |
| `nginx-grpc-proxy-and-retry-configuration` | gRPC 代理配置 |
| `nginx-websocket-proxy-configuration` | WebSocket 代理配置 |

### 安全与认证
| 技能 | 用途 |
|------|------|
| `nginx-jwt-authentication-configuration` | JWT 验证配置 |
| `nginx-jwt-claim-and-header-extraction` | JWT 声明提取 |
| `nginx-http-basic-auth-configuration` | Basic Auth 配置 |
| `nginx-secure-link-verification` | 安全链接验证 |
| `nginx-ssl-tls-proxy-security` | SSL/TLS 安全配置 |
| `http2-tls-alpn-requirement-check` | HTTP/2 ALPN 检查 |
| `http2-cipher-suite-compliance` | HTTP/2 密码套件合规 |

### 请求处理与生命周期
| 技能 | 用途 |
|------|------|
| `nginx-http-request-phase-handling` | HTTP 请求阶段处理 |
| `nginx-http-request-lifecycle` | HTTP 请求生命周期 |
| `nginx-subrequest-and-internal-redirect` | 子请求与内部重定向 |
| `nginx-subrequest-authorization` | 子请求授权 |
| `nginx-http-header-filter-chain` | 响应头过滤器链 |
| `nginx-http-body-filter-chain-and-buffer-management` | 响应体过滤器链 |

### 变量与逻辑控制
| 技能 | 用途 |
|------|------|
| `nginx-http-variable-system` | HTTP 变量系统 |
| `nginx-geo-ip-matching-and-variable-assignment` | Geo IP 匹配 |
| `nginx-geoip-module-integration` | GeoIP 模块集成 |
| `nginx-real-client-ip-rewrite` | 真实客户端 IP 重写 |

### 特定协议与模块支持
| 技能 | 用途 |
|------|------|
| `mp4-pseudo-streaming-with-nginx` | MP4 伪流媒体 |
| `nginx-image-filter-configuration` | 图像处理配置 |
| `nginx-xslt-module-configuration` | XSLT 模块配置 |
| `nginx-js-module-integration` | njs 模块集成 |
| `nginx-stream-core-configuration` | TCP/UDP 代理配置 |
| `nginx-mail-proxy-authentication` | 邮件代理认证 |

## 常见查询示例

| 问题 | 推荐技能 |
|------|----------|
| 如何实现 MP4 伪流媒体？ | `mp4-pseudo-streaming-with-nginx`, `nginx-mp4-module-buffer-and-rate-control` |
| 如何配置 JWT 认证？ | `nginx-jwt-authentication-configuration`, `nginx-jwt-claim-and-header-extraction` |
| FastCGI 缓存如何失效？ | `fastcgi-cache-control-and-invalidation` |
| proxy_pass URI 如何重写？ | `nginx-proxy-pass-uri-rewriting` |
| 如何实现 WebSocket 代理？ | `nginx-websocket-proxy-configuration` |
| 如何动态管理上游服务器？ | `nginx-upstream-dynamic-configuration`, `nginx-dynamic-upstream-configuration` |
| 如何调优连接并发？ | `nginx-connection-concurrency-tuning` |
| HTTP/2 有哪些安全要求？ | `http2-tls-alpn-requirement-check`, `http2-cipher-suite-compliance` |

## Nginx 版本说明

### 开源版 vs 商业版（Nginx Plus）

以下功能**仅限 Nginx Plus**：
- `nginx-jwt-authentication-configuration` - JWT 验证
- `nginx-upstream-health-check-configuration` - 主动健康检查
- `nginx-upstream-dynamic-configuration` - 动态上游管理
- `nginx-plus-status-api-structure` - 状态 API
- `nginx-session-logging` - 会话日志

### 版本兼容性注意

部分技能涉及特定版本要求，使用时注意：
- JWT leeway 支持：1.13.10+
- HTTP/2 ALPN：OpenSSL 1.0.2+
- njs 模块：需单独安装

## 开发约定

### 模块开发规范
- 遵循 `nginx-c-data-type-conventions` 的类型规范
- 使用 `nginx_module_coding_standards` 的编码风格
- 内存管理参考 `nginx-memory-management-pool-and-shared-memory`
- 贡献代码前阅读 `nginx-code-contribution-guidelines`

### 配置最佳实践
- 域名重定向：`nginx-domain-redirect-best-practice`
- 上游故障转移：`fastcgi-upstream-failover-configuration`, `nginx-scgi-failover-and-retry`
- 错误处理：`nginx-error-handling-and-logging`

## 使用建议

1. **按场景查找**：根据具体需求在 `index.md` 或上表定位相关技能
2. **阅读 SKILL.md**：每个技能文档包含触发条件、操作步骤、配置示例
3. **查阅 references**：复杂技能可能有补充文档
4. **注意版本限制**：部分功能有版本或商业版要求
5. **组合使用**：多个技能可组合解决复杂问题（如 JWT 认证 + 声明提取）

---

*本文档为 AI 代理上下文文件，用于理解 Nginx 技能库的结构与用法。*
