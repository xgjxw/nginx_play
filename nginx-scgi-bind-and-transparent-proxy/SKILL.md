---
name: nginx-scgi-bind-and-transparent-proxy
description: 配置Nginx SCGI模块的本地源IP绑定与透明代理功能。当需要指定SCGI后端连接使用的本地出口IP地址，或需以客户端真实IP作为源地址向SCGI服务器发起连接（实现透明代理）时使用本技能。
---

# Nginx SCGI本地绑定与透明代理配置

## 适用场景
- 需要强制SCGI请求从特定本地IP发出（如多网卡环境）
- 需要SCGI服务器看到原始客户端IP（而非Nginx服务器IP），即实现透明代理
- 需要取消继承自上级块的`scgi_bind`设置，恢复系统自动分配行为

## 前提条件
- Nginx版本 ≥ 1.3.12（支持`off`参数）
- Nginx版本 ≥ 1.11.0（支持`transparent`参数）
- Linux系统或具备superuser权限

## 配置步骤
1. 在`location`、`server`或`http`上下文中使用`scgi_bind`指令
2. 指定本地IP地址（可包含变量，如`$remote_addr`）
3. 如需透明代理，在地址后添加`transparent`关键字
4. 如需禁用继承的绑定行为，使用`off`参数
5. 确保系统满足权限与网络路由要求

## 关键注意事项
- `transparent`模式在非Linux系统上通常需要以superuser运行worker进程
- Linux系统（≥1.13.8）会自动授予worker进程`CAP_NET_RAW`能力，无需手动提权
- 必须正确配置内核路由表，使SCGI服务器的返回流量能被Nginx拦截，否则`transparent`无效

> 提示：若不确定是否需要透明代理，请优先测试基本绑定功能；仅在SCGI后端依赖真实客户端IP时启用`transparent`。