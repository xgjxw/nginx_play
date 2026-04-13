## 哈希生成示例（UNIX/Linux）

### 基础模式
```bash
echo -n 'linksecret' | openssl md5 -hex
```
输出为 32 位十六进制字符串，用于 URI 中的 hash 部分。

### 增强模式
```bash
echo -n 'expires/uriremote_addr secret' | openssl md5 -binary | base64 | tr +/ -_ | tr -d =
```
说明：
- `expires`：过期时间戳（如 1735689600）
- `uri`：请求路径（不含查询参数，如 /download/file.zip）
- `remote_addr`：客户端 IP（可选，用于绑定）
- `secret`：预设密钥

最终输出为 base64url 编码的 22 字符字符串，作为 `md5` 参数传递。

> 注意：表达式中的拼接顺序必须与 Nginx 配置中的 `secure_link_md5` 完全一致。