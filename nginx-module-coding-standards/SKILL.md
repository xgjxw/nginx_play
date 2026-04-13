---
name: nginx-module-coding-standards
description: 编写符合 Nginx 官方风格指南的 C 模块代码。当开发新 Nginx 模块或修改现有模块源码时，必须遵循本技能描述的格式、命名和结构规范，以确保代码可合并性和运行稳定性。
---

# Nginx 模块开发代码规范

## 触发条件
编写任何 Nginx 模块 C 代码时必须应用本规范。

## 核心规范
### 格式要求
- 行宽 ≤ 80 字符
- 缩进使用 4 空格（禁用制表符）
- 无尾随空格
- 二元运算符两侧加空格

### 命名约定
- 全局符号前缀：`ngx_`（核心）、`ngx_http_`（HTTP 模块）
- 类型名以 `_t` 结尾（如 `ngx_str_t`）
- 函数指针类型以 `_pt` 结尾
- 宏常量全大写（`NGX_HTTP_OK`），宏函数小写（`ngx_buf_size`）

### 文件结构顺序
1. 版权声明
2. `#include`（先核心头，再模块头，最后外部库）
3. 预处理器定义
4. 类型定义
5. 函数原型
6. 变量定义
7. 函数定义

### 头文件保护
```c
#ifndef _NGX_MODULE_H_INCLUDED_
#define _NGX_MODULE_H_INCLUDED_
...
#endif /* _NGX_MODULE_H_INCLUDED_ */
```

### 注释与表达式
- 禁用 `//` 注释，使用 `/* ... */`
- 英文注释，美式拼写
- 指针比较：`ptr != NULL`
- 控制流：`if (...) {` 同行，`switch` 的 `case` 与 `switch` 对齐

## 典型应用场景
- 提交官方 Nginx 模块补丁
- 开发第三方兼容模块
- 代码审查与重构