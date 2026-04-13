---
name: nginx-xslt-module-configuration
description: 配置和启用 nginx 的 XSLT 模块以将 XML 响应转换为 HTML。当需要在 nginx 中对 XML 响应执行 XSLT 转换（如 API 输出美化或格式适配）时使用本技能。
---

# Nginx XSLT 模块配置

## 何时使用
- 需要将后端返回的 XML 响应通过 XSLT 样式表转换为 HTML 或其他格式
- 使用 nginx 作为反向代理或静态服务器，并希望在响应发送前进行 XML 转换
- 系统已安装 libxml2 和 libxslt 库，且可重新编译 nginx

## 如何执行

### 1. 编译时启用模块
在 nginx 源码编译阶段，必须显式添加 `--with-http_xslt_module` 参数：

```bash
./configure --with-http_xslt_module [其他参数]
make && make install
```

> 注意：该模块默认不包含，且依赖系统已安装 libxml2 和 libxslt 开发库。

### 2. 配置 XSLT 转换规则
在 nginx 配置文件中（如 server 或 location 块内）使用以下指令：

- **`xslt_stylesheet`**：指定一个或多个 XSLT 样式表路径，按顺序应用。
- **`xslt_param`**：传递 XPath 表达式作为参数。
- **`xslt_string_param`**：传递纯字符串参数（不解析为 XPath）。
- **`xml_entities`**：指定 DTD 文件路径，仅用于定义字符实体（如 `&nbsp;`）。
- **`xslt_types`**：扩展支持的输入 MIME 类型，默认为 `text/xml`；可设为 `*` 匹配任意类型（nginx 0.8.29+）。
- **`xsl_last_modified on`**：保留原始响应的 `Last-Modified` 头以支持缓存（默认关闭）。

### 3. 输出行为
- 转换后的响应自动设置 `Content-Type: text/html`。
- 所有参数支持 nginx 变量（如 `$arg_user`）。

> ⚠️ 本技能仅适用于 XML 到 HTML/XSLT 的转换场景，不适用于非 XML 响应处理。