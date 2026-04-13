# JWT声明与头部提取详细示例

## 多级声明提取

```nginx
# JWT payload: {"user": {"profile": {"id": "123", "roles": ["admin", "editor"]}}}
auth_jwt_claim_set $user_id user profile id;
auth_jwt_claim_set $roles user profile roles;  # 1.13.7+ 返回 "admin,editor"
```

## JOSE头部提取

```nginx
# JOSE header: {"alg": "RS256", "kid": "key-2023"}
auth_jwt_header_set $algorithm alg;
auth_jwt_header_set $key_id kid;
```

## 版本兼容性说明

- **Nginx < 1.13.7**：
  - `auth_jwt_claim_set $var a b;` 无效，仅接受单个名称
  - 若声明值为数组，结果不可预测
- **Nginx ≥ 1.13.7**：
  - 支持任意深度键路径
  - 数组自动序列化为逗号分隔字符串（无空格）

## 常见错误

- 键名大小写敏感：`e-mail` ≠ `email`
- 变量必须以`$`开头
- 指令必须位于`location`或`server`上下文中，且在`auth_jwt`之后