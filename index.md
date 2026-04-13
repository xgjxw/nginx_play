# Nginx 核心技能合集

本技能合集源自书籍《1E84Fd37-279A-41Ce-9Cdc-311C0Eaadf5C》，全面覆盖 Nginx 的核心配置、性能调优、模块开发、安全控制及高级代理功能。内容涵盖从基础部署到高阶定制的 80 项关键技能，包括 HTTP/HTTPS/WebSocket/gRPC 代理、缓存机制、身份认证（如 JWT）、动态上游管理、内存与连接优化、日志与错误处理、第三方模块集成（如 JS、XSLT、图像处理）以及 Nginx Plus 特性等，适用于系统工程师、DevOps 工程师和 Web 架构师深入掌握 Nginx 全栈能力。

## Available Skills

| Skill | Description | Use When |
|-------|-------------|----------|
| [mp4-pseudo-streaming-with-nginx](mp4-pseudo-streaming-with-nginx/SKILL.md) | 通过nginx的http_mp4_module实现基于时间范围的伪流媒体响应 | 当HTTP请求包含start或end查询参数且目标为MP4、.m4v或.m4a文件时 |
| [nginx-source-build-configuration](nginx-source-build-configuration/SKILL.md) | 配置Nginx源码编译参数以自定义功能、路径和依赖库 | 当需要定制Nginx（如启用特定模块、集成第三方库或调整运行时路径）且无法通过包管理器满足需求时 |
| [nginx-process-control-and-config-reload](nginx-process-control-and-config-reload/SKILL.md) | 通过标准信号机制管理Nginx主进程和工作进程的生命周期，包括优雅关闭、快速终止、配置重载和日志轮转 | 当需要在不中断服务的前提下更新Nginx配置、重启服务或管理运行中的实例时 |
| [nginx-connection-concurrency-tuning](nginx-connection-concurrency-tuning/SKILL.md) | 配置nginx的连接并发能力，包括worker_processes、worker_connections和accept_mutex设置 | 当需要调整nginx实例的最大并发连接数或解决“惊群问题”时 |
| [nginx-subrequest-and-internal-redirect](nginx-subrequest-and-internal-redirect/SKILL.md) | 创建子请求以嵌入其他资源输出，或执行内部重定向以改变请求处理路径 | 当需要在不暴露给客户端的情况下复用location逻辑、实现SSI包含或动态切换处理流程时 |
| [nginx-jwt-authentication-configuration](nginx-jwt-authentication-configuration/SKILL.md) | 配置Nginx的ngx_http_auth_jwt_module模块以验证HTTP请求中的JWT令牌 | 当用户需要在Nginx中启用基于JWT的访问控制（如保护API端点或集成OpenID Connect）时 |
| [nginx-userid-cookie-configuration](nginx-userid-cookie-configuration/SKILL.md) | 配置和管理ngx_http_userid_module模块的Cookie属性、标记机制及userid指令行为 | 当用户在nginx配置中使用userid、userid_name、userid_domain、userid_path、userid_expires、userid_p3p、userid_mark或userid_service指令时 |
| [nginx-thread-pool-io-optimization](nginx-thread-pool-io-optimization/SKILL.md) | 配置nginx线程池以实现非阻塞文件I/O | 当使用aio指令且需要避免I/O阻塞工作进程时 |
| [fastcgi-cache-configuration-and-lifecycle](fastcgi-cache-configuration-and-lifecycle/SKILL.md) | 配置Nginx的FastCGI响应缓存体系，包括共享内存区、磁盘存储路径及后台管理进程 | 当需要通过FastCGI缓存提升动态内容性能，并需控制缓存存储结构、过期策略或使用商业版purger功能时 |
| [nginx-server-names-hash-tuning](nginx-server-names-hash-tuning/SKILL.md) | 调整server_names_hash_max_size和server_names_hash_bucket_size参数以解决哈希表构建失败问题 | 当Nginx启动时报“could not build the server_names_hash”错误，且http配置块中定义了大量或超长server_name时 |
| [nginx-domain-redirect-best-practice](nginx-domain-redirect-best-practice/SKILL.md) | 正确配置Nginx将非规范域名永久重定向到主域名 | 当需处理多个域名或捕获非法Host请求以统一入口域名、避免重复内容或提升SEO时 |
| [nginx-mp4-module-buffer-and-rate-control](nginx-mp4-module-buffer-and-rate-control/SKILL.md) | 配置和管理Nginx ngx_http_mp4_module模块中的缓冲区大小与传输速率限制 | 当在location块中启用了mp4指令，且客户端请求包含start或end参数用于MP4伪流时 |
| [nginx-ngx-buf-t-buffer-structure](nginx-ngx-buf-t-buffer-structure/SKILL.md) | 定义并解释nginx中ngx_buf_t缓冲区结构的字段含义与使用方法 | 当在nginx C模块开发中需要处理内存或文件I/O数据缓冲时 |
| [nginx-code-contribution-guidelines](nginx-code-contribution-guidelines/SKILL.md) | 指导开发者遵循社区开发规范准备和提交补丁至nginx官方仓库 | 当用户完成对nginx源码的修改并计划向官方项目贡献代码时（而非仅用于本地调试） |
| [nginx-subrequest-authorization](nginx-subrequest-authorization/SKILL.md) | 配置并使用ngx_http_auth_request_module模块，通过向授权服务发起子请求来控制主请求的访问权限 | 当需要基于外部认证/授权服务（如OAuth、JWT验证或自定义鉴权接口）动态决定是否允许客户端访问特定location时 |
| [proxy-cache-core-configuration-and-key-generation](proxy-cache-core-configuration-and-key-generation/SKILL.md) | 配置Nginx代理缓存的核心参数，包括缓存启用、缓存键生成规则及有效期控制 | 当需要缓存反向代理的HTTP响应，并需自定义缓存键、有效期或绕过/禁止缓存逻辑时 |
| [nginx-response-buffering-control](nginx-response-buffering-control/SKILL.md) | 控制nginx对后端响应（FastCGI或代理）的缓冲行为 | 当需要优化性能、控制内存/磁盘使用，或处理大响应体时 |
| [nginx-error-log-configuration](nginx-error-log-configuration/SKILL.md) | 配置Nginx的error_log指令以控制日志输出目标和日志级别 | 当需要调整Nginx错误日志的详细程度、输出位置或启用调试日志时 |
| [nginx-thread-pool-task-handling](nginx-thread-pool-task-handling/SKILL.md) | 在Nginx中使用线程池处理阻塞I/O操作或同步库调用 | 当需要执行可能阻塞工作进程的任务（如文件I/O）时 |
| [nginx-memory-management-pool-and-shared-memory](nginx-memory-management-pool-and-shared-memory/SKILL.md) | 在Nginx开发中选择合适的内存管理方式（系统堆、内存池或共享内存）并正确执行分配、使用与释放操作 | 当需要动态分配内存或实现多进程间共享数据时 |
| [nginx-scgi-response-buffering-control](nginx-scgi-response-buffering-control/SKILL.md) | 控制Nginx SCGI响应的缓冲行为（启用/禁用缓冲、内存与磁盘缓冲配置、动态覆盖机制） | 当需要优化SCGI后端响应传输方式（如选择流式传输或完整缓冲）以提升性能或降低延迟时 |
| [nginx-http-request-phase-handling](nginx-http-request-phase-handling/SKILL.md) | 理解和控制Nginx处理HTTP请求时的11个阶段及其处理程序执行逻辑 | 当需要开发或调试Nginx模块、配置自定义处理逻辑、分析请求流程或排查阶段行为异常时 |
| [nginx-jwt-claim-and-header-extraction](nginx-jwt-claim-and-header-extraction/SKILL.md) | 从已验证的JWT令牌中提取声明或JOSE头部参数到自定义变量 | 当配置了auth_jwt_claim_set或auth_jwt_header_set指令且JWT验证成功时，适用于需要基于JWT内容进行路由、日志记录或访问控制的场景 |
| [nginx-index-and-rate-limiting](nginx-index-and-rate-limiting/SKILL.md) | 配置Nginx的索引文件处理以及连接数和请求速率限制 | 当需要为目录请求自动返回默认文件，或对客户端实施并发连接/请求频率限制以防止资源滥用或DDoS攻击时 |
| [nginx-http-module-config-merge](nginx-http-module-config-merge/SKILL.md) | 配置并合并Nginx HTTP模块的三层配置结构（main、server、location） | 当解析nginx.conf并遇到HTTP模块指令，需初始化或合并配置结构体时 |
| [nginx-welcome-page-health-check](nginx-welcome-page-health-check/SKILL.md) | 判断HTTP响应是否为标准Nginx默认欢迎页面（包含"Welcome to nginx!"字符串） | 当需要确认Nginx服务是否正常运行并返回默认欢迎页时 |
| [nginx-c-data-type-conventions](nginx-c-data-type-conventions/SKILL.md) | 正确使用nginx定义的整数与字符串类型（如ngx_int_t、ngx_uint_t和ngx_str_t）并遵循其初始化和头文件包含规范 | 当开发核心模块、HTTP/邮件/流模块等nginx C代码且涉及字符串或整数操作时 |
| [nginx-event-loop-processing](nginx-event-loop-processing/SKILL.md) | 处理Nginx worker或helper进程中的事件循环，包括I/O事件、超时事件和已发布事件的调度与执行 | 当用户需要理解、调试或优化Nginx异步事件处理机制（如epoll/kqueue下的事件调度流程）时 |
| [fastcgi-upstream-failover-configuration](fastcgi-upstream-failover-configuration/SKILL.md) | 配置Nginx的FastCGI上游服务器重试与故障转移机制 | 当需要提升后端PHP或其他FastCGI应用的高可用性，且满足“尚未向客户端发送任何响应数据”等重试前提条件时 |
| [nginx-connection-management-and-reuse](nginx-connection-management-and-reuse/SKILL.md) | 管理nginx worker进程中的连接分配与重用 | 当连接池耗尽且需要新连接时，适用于HTTP或Stream模块中需动态复用空闲连接的场景 |
| [nginx-proxy-embedded-variables](nginx-proxy-embedded-variables/SKILL.md) | 提供Nginx ngx_http_proxy_module中$proxy_host、$proxy_port和$proxy_add_x_forwarded_for嵌入变量的定义与行为说明 | 当配置中使用proxy_set_header指令并引用这些变量时 |
| [nginx-scgi-cache-configuration](nginx-scgi-cache-configuration/SKILL.md) | 配置Nginx对SCGI响应的缓存存储、生命周期、更新策略及清除机制 | 当需要通过缓存SCGI响应来减少后端负载、提升响应速度或处理高并发请求时 |
| [nginx-geo-ip-matching-and-variable-assignment](nginx-geo-ip-matching-and-variable-assignment/SKILL.md) | 使用geo指令根据客户端IP地址匹配CIDR块或IP范围，并将对应值赋给自定义变量 | 当请求到达且配置中引用了由geo定义的变量时 |
| [fastcgi-cache-control-and-invalidation](fastcgi-cache-control-and-invalidation/SKILL.md) | 控制Nginx中FastCGI缓存的命中、写入、过期使用及清除行为 | 当配置了fastcgi_cache并需要根据请求变量、响应状态或错误条件动态决定缓存行为时 |
| [nginx-proxy-set-header-empty-value-handling](nginx-proxy-set-header-empty-value-handling/SKILL.md) | 控制Nginx在反向代理时是否传递特定HTTP请求头 | 当你需要主动移除某个客户端请求头（如Accept-Encoding）以防止其透传到后端服务时 |
| [nginx-websocket-proxy-configuration](nginx-websocket-proxy-configuration/SKILL.md) | 配置Nginx以正确代理WebSocket连接，确保Upgrade和Connection头部被正确传递，并处理连接超时 | 当需要通过Nginx反向代理实现实时双向通信（如聊天、实时通知）且客户端通过/chat/等路径发起WebSocket请求时 |
| [nginx-geoip-module-integration](nginx-geoip-module-integration/SKILL.md) | 在nginx中集成MaxMind GeoIP数据库并生成地理位置变量 | 当配置文件中使用geoip_country、geoip_city或geoip_org指令时 |
| [nginx-upstream-health-check](nginx-upstream-health-check/SKILL.md) | 判定Nginx上游服务器或HTTP服务端点是否处于正常运行状态（非维护模式且返回有效成功状态码） | 当需要在负载均衡或反向代理配置中实现自定义健康检查逻辑，且需排除重定向和维护模式响应时 |
| [nginx-error-handling-and-logging](nginx-error-handling-and-logging/SKILL.md) | 在Nginx开发中获取跨平台错误码、优化性能并记录结构化日志 | 当系统调用或socket操作失败，适用于涉及系统调用封装函数、错误处理代码或日志记录模块的场景 |
| [http2-tls-alpn-requirement-check](http2-tls-alpn-requirement-check/SKILL.md) | 检查在配置nginx启用HTTP/2 over TLS时是否满足ALPN的OpenSSL版本要求 | 当用户配置了listen 443 ssl http2指令时 |
| [nginx-core-data-structure-operations](nginx-core-data-structure-operations/SKILL.md) | 在nginx开发中使用动态数组、分段列表、侵入式队列、红黑树或哈希表进行高性能数据操作 | 当需要高效查找或遍历，适用于HTTP头处理、配置解析、事件队列管理及缓存索引等场景 |
| [nginx-proxy-store-static-caching](nginx-proxy-store-static-caching/SKILL.md) | 配置Nginx将代理响应保存为本地静态文件，实现简单缓存机制 | 当需要为不可变静态资源（如图片、CSS、JS）创建本地副本以提升后续请求性能时 |
| [nginx-grpc-proxy-and-retry-configuration](nginx-grpc-proxy-and-retry-configuration/SKILL.md) | 配置Nginx的ngx_http_grpc_module模块以代理gRPC over HTTP/2请求，并设置连接超时、错误重试及SSL/TLS安全通信 | 当配置中包含grpc_pass指令，且需将HTTP/2客户端请求转发至gRPC服务器时 |
| [nginx-proxy-pass-uri-rewriting](nginx-proxy-pass-uri-rewriting/SKILL.md) | 正确配置proxy_pass以转发请求并按规则重写URI | 当你需要将客户端请求代理到上游服务器，并控制最终传递的URI路径格式时 |
| [nginx-image-filter-configuration](nginx-image-filter-configuration/SKILL.md) | 配置image_filter指令对图像资源执行验证、元数据提取、旋转、缩放或裁剪等处理操作 | 当请求路径匹配已配置image_filter的location且响应内容为图像（JPEG/GIF/PNG/WebP）时 |
| [nginx-gzip-compression-and-static-file-handling](nginx-gzip-compression-and-static-file-handling/SKILL.md) | 配置Nginx的gzip动态压缩、gunzip自动解压和gzip_static静态预压缩功能 | 当需要启用或调试Nginx中与gzip相关的压缩、解压或静态.gz文件服务时 |
| [nginx-status-data-version-compatibility](nginx-status-data-version-compatibility/SKILL.md) | 根据Nginx软件版本、状态数据集版本和是否为商业订阅，判断状态接口中哪些字段应存在或缺失 | 当解析Nginx状态数据（如通过stub_status或API）并发现字段与预期不符时 |
| [nginx-response-slice-configuration](nginx-response-slice-configuration/SKILL.md) | 配置Nginx的响应切片模块（http_slice_module），用于对大文件响应进行高效缓存 | 当需要优化大文件（如视频、固件、大型静态资源）的缓存效率并减少回源压力时 |
| [nginx-js-module-integration](nginx-js-module-integration/SKILL.md) | 在Nginx配置中集成ngx_http_js_module模块，通过njs函数动态处理HTTP请求或计算变量值 | 当location块使用js_content指令或配置中使用js_set定义变量时 |
| [nginx-image-filter-configuration-2](nginx-image-filter-configuration-2/SKILL.md) | 配置image_filter模块相关参数，用于控制输出图像的质量、格式特性及文件大小 | 当已在HTTP、server或location块中启用image_filter指令，并需要调整JPEG/WebP质量、锐化、透明度或隔行扫描等图像处理行为时 |
| [nginx-proxy-cache-path-configuration](nginx-proxy-cache-path-configuration/SKILL.md) | 配置 Nginx 代理缓存的物理存储结构与后台管理进程，包括文件系统层级、共享内存区域、过期清理策略及加载行为。 | 当需要在 http 上下文中设置 proxy_cache_path 指令以优化缓存性能和资源管理时使用。 |
| [nginx-scgi-bind-and-transparent-proxy](nginx-scgi-bind-and-transparent-proxy/SKILL.md) | 配置Nginx SCGI模块的本地源IP绑定与透明代理功能。 | 当需要指定SCGI后端连接使用的本地出口IP地址，或需以客户端真实IP作为源地址向SCGI服务器发起连接（实现透明代理）时使用。 |
| [uwsgi-bind-address-and-transparent-mode](uwsgi-bind-address-and-transparent-mode/SKILL.md) | 配置Nginx的uwsgi_bind指令以指定uWSGI连接的本地源IP/端口，或启用transparent模式使连接使用客户端真实IP作为源地址。 | 当需要控制uWSGI后端连接的源地址（如实现IP透传、绕过防火墙策略或满足特定网络路由需求）时使用。 |
| [nginx-scgi-failover-and-retry](nginx-scgi-failover-and-retry/SKILL.md) | 配置和管理 Nginx SCGI 模块的上游服务器容错与重试机制。 | 当 SCGI 后端服务器通信失败且满足特定条件（如未向客户端发送响应、请求方法幂等、在重试次数/时间限制内）时，自动切换至备用服务器。 |
| [uwsgi-response-buffering-control](uwsgi-response-buffering-control/SKILL.md) | 控制Nginx在通过uWSGI代理时是否对后端响应进行内存或磁盘缓冲。 | 当需要优化响应延迟与吞吐量之间的权衡（例如流式传输大文件或实时数据）时使用。 |
| [nginx-http-body-filter-chain-and-buffer-management](nginx-http-body-filter-chain-and-buffer-management/SKILL.md) | 实现或调试 Nginx HTTP 响应体过滤器链及缓冲区管理机制。 | 当需要在 ngx_http_output_filter(r, cl) 调用时处理响应正文内容（如压缩、加密、转换格式）并正确管理缓冲区生命周期时使用。 |
| [uwsgi-cache-validity-and-expiration](uwsgi-cache-validity-and-expiration/SKILL.md) | 定义uWSGI响应的缓存有效期规则。 | 当需配置基于状态码、响应头或自定义条件的缓存时间，并处理Set-Cookie/Vary等排除逻辑时使用。 |
| [nginx-xslt-module-configuration](nginx-xslt-module-configuration/SKILL.md) | 配置和启用 nginx 的 XSLT 模块以将 XML 响应转换为 HTML。 | 当需要在 nginx 中对 XML 响应执行 XSLT 转换（如 API 输出美化或格式适配）时使用。 |
| [uwsgi-cache-path-and-storage-management](uwsgi-cache-path-and-storage-management/SKILL.md) | 配置uWSGI响应的持久化缓存存储策略，包括缓存目录结构、共享内存区域、过期清理机制及临时文件处理。 | 当需要为uWSGI设置高效、可扩展的响应缓存系统时使用。 |
| [nginx-http-header-filter-chain](nginx-http-header-filter-chain/SKILL.md) | 实现或调试 Nginx HTTP 响应头过滤器链机制。 | 当需要在 ngx_http_send_header(r) 调用时插入自定义响应头处理逻辑（如添加、修改或删除响应头）时使用。 |
| [nginx-ssi-command-processing](nginx-ssi-command-processing/SKILL.md) | 处理 Nginx 中启用 SSI 后对 HTML 或文本响应内容中 <!-- command ... --> 指令的解析与执行。 | 当响应体包含 SSI 指令、SSI 功能已启用且 MIME 类型匹配 ssi_types 时使用。 |
| [nginx-http-request-lifecycle](nginx-http-request-lifecycle/SKILL.md) | 理解并操作 Nginx HTTP 请求处理的完整生命周期及核心请求对象结构。 | 当需要在特定阶段拦截请求、访问关键字段或调试请求处理流程时使用。 |
| [nginx-http-basic-auth-configuration](nginx-http-basic-auth-configuration/SKILL.md) | 配置 Nginx 的 HTTP 基本认证（Basic Auth），用于保护 HTTP location、server 或 http block 中的资源。 | 当需要对 Web 资源实施简单用户名/密码保护且配合 HTTPS 使用时触发。 |
| [nginx-http-variable-system](nginx-http-variable-system/SKILL.md) | 在 Nginx 模块中注册、访问和操作 HTTP 变量。 | 当需要在运行时动态获取请求上下文信息（如 $uri、$arg_x）或创建自定义变量供配置指令使用时使用。 |
| [nginx-plus-status-api-structure](nginx-plus-status-api-structure/SKILL.md) | 解析 Nginx Plus 状态 API 返回的 JSON 响应对象结构，用于监控运行状态、性能指标和健康状况。 | 仅适用于 Nginx Plus（不适用于开源版），当用户请求 /api 或类似状态端点并需要理解返回字段含义时使用。 |
| [nginx-upstream-load-balancer-implementation](nginx-upstream-load-balancer-implementation/SKILL.md) | 开发或集成 Nginx 上游负载均衡器模块。 | 当需要实现自定义负载均衡算法（如一致性哈希、最少连接）或将请求智能分发到多个后端服务器时使用。 |
| [nginx-module-coding-standards](nginx-module-coding-standards/SKILL.md) | 编写符合 Nginx 官方风格指南的 C 模块代码。 | 当开发新 Nginx 模块或修改现有模块源码时，必须遵循本技能描述的格式、命名和结构规范，以确保代码可合并性和运行稳定性。 |
| [nginx-upstream-health-check-configuration](nginx-upstream-health-check-configuration/SKILL.md) | 配置和管理 NGINX Plus 商业模块 ngx_http_upstream_hc_module 的 HTTP 上游服务器健康检查机制。 | 当用户需要在 location 块中启用对共享内存中的 upstream server group 的主动健康检查，并自定义检查频率、失败/恢复阈值、请求 URI、端口或响应验证规则时使用。 |
| [nginx-ssl-tls-proxy-security](nginx-ssl-tls-proxy-security/SKILL.md) | 配置 Nginx 作为 SSL/TLS 终端（HTTPS 服务器）或加密代理（到上游的 SSL 连接）。 | 适用于需要端到端加密、证书验证或 OCSP Stapling 的安全场景。 |
| [nginx-real-client-ip-rewrite](nginx-real-client-ip-rewrite/SKILL.md) | 使用 ngx_http_realip_module 从可信代理头（如 X-Forwarded-For）重写 $remote_addr。 | 适用于反向代理或负载均衡器后部署 Nginx 的场景，确保日志和访问控制使用真实客户端 IP。 |
| [nginx-udp-session-lifecycle-control](nginx-udp-session-lifecycle-control/SKILL.md) | 配置 proxy_requests 和 proxy_responses 控制 UDP 代理会话的生命周期。 | 适用于 DNS、Syslog 等无连接协议，防止资源长期占用。 |
| [http2-cipher-suite-compliance](http2-cipher-suite-compliance/SKILL.md) | 检查启用了 HTTP/2 和 ssl_prefer_server_ciphers=on 的服务器所配置的 SSL 密码套件是否符合 RFC 7540 Appendix A 黑名单要求。 | 当用户配置或排查 HTTP/2 SSL 连接问题，特别是遇到浏览器拒绝连接（如 Chrome 报错）时使用。 |
| [nginx-transparent-proxy-binding](nginx-transparent-proxy-binding/SKILL.md) | 配置 proxy_bind 或 fastcgi_bind 的 transparent 模式，使代理连接源 IP 伪装为客户端真实 IP。 | 适用于需要保留原始客户端 IP 的高级网络架构（如 DSR、安全审计）。 |
| [nginx-session-logging](nginx-session-logging/SKILL.md) | 配置基于会话的聚合日志（而非每请求日志）。 | 适用于需要跟踪用户会话行为（如电商、登录流）的场景，需启用 ngx_http_session_log_module。 |
| [nginx-upstream-dynamic-configuration](nginx-upstream-dynamic-configuration/SKILL.md) | 通过 Nginx Plus API 动态管理 HTTP/Stream 上游服务器的参数（如权重、状态、连接限制）。 | 适用于需要运行时调整负载均衡行为、执行蓝绿部署或故障隔离的场景。 |
| [nginx-secure-link-verification](nginx-secure-link-verification/SKILL.md) | 配置和使用 Nginx 的 ngx_http_secure_link_module 模块，以保护资源链接免遭未授权访问或限制其有效期。 | 当需要为静态资源（如下载文件、媒体内容）生成带时效性或防盗链的安全 URL 时使用。 |
| [nginx-stream-core-configuration](nginx-stream-core-configuration/SKILL.md) | 配置 TCP/UDP 代理的监听套接字、访问控制、连接限制、日志和变量映射。 | 适用于四层负载均衡、数据库代理或通用 TCP/UDP 转发场景。 |
| [nginx-dynamic-upstream-configuration](nginx-dynamic-upstream-configuration/SKILL.md) | 动态管理 Nginx 上游服务器组（HTTP 或 Stream）的配置，包括查看、添加、删除和修改服务器。 | 当用户需要通过 HTTP 接口实时调整 upstream 配置（如扩缩容、故障隔离或权重调整）时使用。 |
| [nginx-mail-proxy-authentication](nginx-mail-proxy-authentication/SKILL.md) | 配置 Nginx 邮件模块（IMAP/POP3/SMTP）的 HTTP 认证后端和身份验证方法。 | 适用于将邮件认证委托给外部 HTTP 服务的场景。 |
| [uwsgi-upstream-failover-configuration](uwsgi-upstream-failover-configuration/SKILL.md) | 配置uWSGI上游服务器组的自动故障转移机制，以在高可用架构中实现请求自动重试和切换。 | 当需要在uWSGI服务器发生错误、超时或返回特定HTTP状态码时自动将请求转发至备用服务器，且尚未向客户端发送任何响应数据时使用。 |

## 快速导航

### 基础配置与部署
- nginx-welcome-page-health-check
- nginx-source-build-configuration
- nginx-process-control-and-config-reload
- nginx-error-log-configuration
- nginx-c-data-type-conventions
- nginx-module-coding-standards
- nginx-code-contribution-guidelines

### 性能调优与资源管理
- nginx-connection-concurrency-tuning
- nginx-thread-pool-io-optimization
- nginx-thread-pool-task-handling
- nginx-memory-management-pool-and-shared-memory
- nginx-response-buffering-control
- nginx-scgi-response-buffering-control
- uwsgi-response-buffering-control
- nginx-http-body-filter-chain-and-buffer-management

### 缓存机制
- fastcgi-cache-configuration-and-lifecycle
- fastcgi-cache-control-and-invalidation
- proxy-cache-core-configuration-and-key-generation
- nginx-proxy-cache-path-configuration
- nginx-proxy-store-static-caching
- nginx-scgi-cache-configuration
- uwsgi-cache-validity-and-expiration
- uwsgi-cache-path-and-storage-management

### 代理与上游管理
- nginx-proxy-pass-uri-rewriting
- nginx-proxy-set-header-empty-value-handling
- nginx-proxy-embedded-variables
- nginx-upstream-load-balancer-implementation
- nginx-upstream-health-check
- nginx-upstream-health-check-configuration
- nginx-upstream-dynamic-configuration
- nginx-dynamic-upstream-configuration
- fastcgi-upstream-failover-configuration
- nginx-scgi-failover-and-retry
- uwsgi-upstream-failover-configuration
- nginx-grpc-proxy-and-retry-configuration
- nginx-websocket-proxy-configuration

### 安全与认证
- nginx-jwt-authentication-configuration
- nginx-jwt-claim-and-header-extraction
- nginx-http-basic-auth-configuration
- nginx-secure-link-verification
- nginx-ssl-tls-proxy-security
- http2-tls-alpn-requirement-check
- http2-cipher-suite-compliance

### 请求处理与生命周期
- nginx-http-request-phase-handling
- nginx-http-request-lifecycle
- nginx-subrequest-and-internal-redirect
- nginx-subrequest-authorization
- nginx-http-header-filter-chain
- nginx-ssi-command-processing

### 变量与逻辑控制
- nginx-http-variable-system
- nginx-geo-ip-matching-and-variable-assignment
- nginx-geoip-module-integration
- nginx-real-client-ip-rewrite

### 特定协议与模块支持
- mp4-pseudo-streaming-with-nginx
- nginx-mp4-module-buffer-and-rate-control
- nginx-image-filter-configuration
- nginx-image-filter-configuration-2
- nginx-xslt-module-configuration
- nginx-js-module-integration
- nginx-mail-proxy-authentication
- nginx-stream-core-configuration
- nginx-udp-session-lifecycle-control

### 高级网络与透明代理
- nginx-transparent-proxy-binding
- nginx-scgi-bind-and-transparent-proxy
- uwsgi-bind-address-and-transparent-mode

### 监控与状态
- nginx-status-data-version-compatibility
- nginx-plus-status-api-structure
- nginx-session-logging

### 其他实用功能
- nginx-userid-cookie-configuration
- nginx-domain-redirect-best-practice
- nginx-server-names-hash-tuning
- nginx-index-and-rate-limiting
- nginx-response-slice-configuration
- nginx-event-loop-processing
- nginx-core-data-structure-operations
- nginx-ngx-buf-t-buffer-structure
- nginx-http-module-config-merge
- nginx-connection-management-and-reuse

## 使用方法

本技能库可用于快速查询 Nginx 相关配置或开发问题。使用时，请结合具体场景构造提示（prompt），例如：

- “如何使用 nginx 实现 MP4 伪流媒体并控制缓冲与码率？” → 对应技能：`mp4-pseudo-streaming-with-nginx` 和 `nginx-mp4-module-buffer-and-rate-control`
- “Nginx 如何通过 JWT 验证用户身份并提取声明？” → 对应技能：`nginx-jwt-authentication-configuration` 和 `nginx-jwt-claim-and-header-extraction`
- “怎样为 FastCGI 后端配置缓存失效策略？” → 对应技能：`fastcgi-cache-control-and-invalidation`

请直接引用技能名称以获取精准指导。