---
name: Nginx源码构建配置
description: 配置Nginx源码编译参数以自定义功能、路径和依赖库。当需要定制Nginx（如启用特定模块、集成第三方库或调整运行时路径）且无法通过包管理器满足需求时使用此技能。
---

# Nginx源码构建配置

## 适用场景
- 需要启用或禁用特定HTTP/Stream模块（如SSL、gzip、rewrite等）
- 需自定义安装路径、日志位置或运行用户
- 包管理器提供的Nginx版本不满足功能或安全要求
- 需集成外部静态或动态模块

## 前提条件
- 已下载Nginx源码
- 系统已安装编译工具链（gcc、make等）
- 如需相关功能，已准备第三方库源码（PCRE、zlib、OpenSSL）

## 配置步骤

1. **执行`./configure`命令**，指定构建选项，生成Makefile。
2. **按需设置以下关键参数类别**：
   - **基础路径**：使用`--prefix`、`--sbin-path`、`--conf-path`等定义文件和目录位置。
   - **运行用户/组**：通过`--user`和`--group`指定工作进程权限。
   - **HTTP模块控制**：使用`--with-http_*_module`启用或`--without-http_*_module`禁用模块。
   - **Stream模块**：添加`--with-stream`启用TCP/UDP代理，并可单独配置子模块。
   - **第三方库集成**：通过`--with-pcre`、`--with-zlib`、`--with-openssl`指定库源路径；可选启用JIT优化。
   - **编译优化**：使用`--with-cc-opt`、`--with-ld-opt`传递编译/链接参数；`--with-cpu-opt`针对CPU优化。
   - **外部模块**：使用`--add-module`（静态）或`--add-dynamic-module`（动态）集成自定义模块；配合`--with-compat`确保兼容性。
3. **执行`make`和`make install`**完成编译与安装。

> 注意：此流程仅适用于从源码构建Nginx，不适用于通过apt、yum、pkg等包管理器安装的场景。