---
name: nginx-jwt-claim-and-header-extraction
description: 在Nginx中从已验证的JWT令牌中提取声明（claims）或JOSE头部参数到自定义变量。当配置了auth_jwt_claim_set或auth_jwt_header_set指令且JWT验证成功时使用此技能，适用于需要基于JWT内容进行路由、日志记录或访问控制的场景。
---

# Nginx JWT声明与头部提取

## 何时使用
- JWT已通过`auth_jwt`模块成功验证
- 需要将JWT payload中的特定声明（如用户邮箱、角色）或JOSE头部（如`alg`、`kid`）映射为Nginx变量
- 后续配置（如`proxy_set_header`、`access_log`、`if`条件判断）依赖这些提取的值

## 如何执行

### 1. 提取JWT声明
使用`auth_jwt_claim_set`指令将JWT payload中的声明值赋给Nginx变量：

```nginx
auth_jwt_claim_set $variable name ...;
```

- `name`支持多级键路径（从JSON根开始匹配）
- Nginx 1.13.7及以上版本支持数组值（自动转为逗号分隔字符串）
- 示例：`auth_jwt_claim_set $email info e-mail;` 从 `{"info": {"e-mail": "user@example.com"}}` 提取邮箱

### 2. 提取JOSE头部
使用`auth_jwt_header_set`指令提取JOSE头部参数：

```nginx
auth_jwt_header_set $variable name ...;
```

- 语法和行为与`auth_jwt_claim_set`一致
- 示例：`auth_jwt_header_set $alg alg;` 获取签名算法

### 3. 版本注意事项
- 仅适用于Nginx 1.11.10+
- 1.13.7之前：仅支持单个键名，数组行为未定义

### 4. 内置变量（可选）
- `$jwt_header_<name>`：直接获取指定JOSE头部值
- `$jwt_claim_<name>`：直接获取指定声明值

> 详细示例与边界情况见参考文档。