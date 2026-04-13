---
name: uWSGI绑定地址与透明模式配置
description: 配置Nginx的uwsgi_bind指令以指定uWSGI连接的本地源IP/端口，或启用transparent模式使连接使用客户端真实IP作为源地址。当需要控制uWSGI后端连接的源地址（如实现IP透传、绕过防火墙策略或满足特定网络路由需求）时使用此技能。
---

# uWSGI绑定地址与透明模式配置

## 何时使用
- 需要为发往uWSGI服务器的连接指定固定的本地IP或端口
- 需要让uWSGI后端看到客户端的真实IP作为连接源地址（而非Nginx服务器IP）
- 在多宿主或多IP环境中精确控制出站连接的源地址

## 前提条件
- Nginx版本 ≥ 1.11.0（transparent参数支持）
- Linux系统推荐；若在非Linux系统使用transparent，需以superuser权限运行Nginx工作进程

## 配置步骤
1. 在`http`、`server`或`location`上下文中添加`uwsgi_bind`指令：
   ```nginx
   uwsgi_bind address [transparent] | off;
   ```
2. `address`可为：
   - 固定IP（如`192.168.1.100`）
   - IP加端口（如`192.168.1.100:8080`）
   - 变量（如`$remote_addr`，需Nginx ≥ 1.3.12）
3. 使用`transparent`参数启用透明绑定模式（Nginx ≥ 1.11.0）：
   ```nginx
   uwsgi_bind $remote_addr transparent;
   ```
4. 使用`off`取消继承的绑定设置，允许系统自动分配源地址（Nginx ≥ 1.3.12）
5. **关键**：确保内核路由表已正确配置，能将来自uWSGI服务器的返回流量导向Nginx，否则连接将失败

## 注意事项
- `transparent`在Linux上自Nginx 1.13.8起无需额外权限（主进程自动授予CAP_NET_RAW）
- 此功能仅适用于uWSGI后端，不适用于FastCGI、gRPC等其他协议
- 若未配置正确路由，即使配置成功，连接也会超时或失败