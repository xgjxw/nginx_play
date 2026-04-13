---
name: nginx-core-data-structure-operations
description: 在 nginx 开发中，当需要使用动态数组、分段列表、侵入式队列、红黑树或哈希表（含通配符匹配）进行高性能数据操作时，应用此技能。适用于 HTTP 头处理、配置解析、事件队列管理及缓存索引等场景，且要求动态容器支持高效查找或遍历。
---

# Nginx 核心数据结构操作规范

## 触发条件
当满足以下任一条件时使用本技能：
- 需要在 nginx 模块中管理动态增长的数据集合
- 涉及 HTTP 头字段的增删查改
- 实现配置项的高效解析与存储
- 构建事件调度队列或缓存索引结构
- 要求 O(log n) 或 O(1) 级别的查找性能

> **注意**：本技能不适用于固定大小的静态数组场景。

## 核心操作流程

### 1. 动态数组（ngx_array_t）
- **创建**：使用 `ngx_array_create(pool, n, size)` 或 `ngx_array_init(array, pool, n, size)`
- **添加元素**：调用 `ngx_array_push(a)`（单个）或 `ngx_array_push_n(a, n)`（多个）
- **自动扩容**：空间不足时自动分配新块（通常为原大小两倍）并复制数据

### 2. 分段列表（ngx_list_t）
- **适用场景**：大量插入操作，如 HTTP 头字段存储
- **初始化**：`ngx_list_init(list, pool, n, size)` 或 `ngx_list_create(pool, n, size)`
- **添加元素**：`ngx_list_push(list)`
- **遍历方式**：需手动遍历每个 part 结构
- **删除逻辑**：不直接支持删除，可通过设置 `hash=0` 标记为无效

### 3. 侵入式队列（ngx_queue_t）
- **特性**：节点嵌入目标结构体，节省内存分配
- **关键操作**：
  - 插入：`ngx_queue_insert_head/tail`
  - 删除：`ngx_queue_remove`
  - 分割/合并：`ngx_queue_split/add`
- **遍历模板**：
  ```c
  for (q = ngx_queue_head(h); q != ngx_queue_sentinel(h); q = ngx_queue_next(q))
  ```
- **获取数据**：使用 `ngx_queue_data(q, type, link)` 宏

### 4. 红黑树（ngx_rbtree_t）
- **初始化**：`ngx_rbtree_init(&rbtree, &sentinel, insert_func)`
- **插入流程**：分配节点 → 设置 key → 调用 `ngx_rbtree_insert(&rbtree, node)`
- **查找方法**：自定义循环比较 key 和 hash 值
- **删除操作**：`ngx_rbtree_delete(&rbtree, node)`

### 5. 哈希表（ngx_hash_t / ngx_hash_combined_t）
- **精确匹配流程**：
  1. 初始化键数组：`ngx_hash_keys_array_init(&keys, NGX_HASH_SMALL/LARGE)`
  2. 添加键值对：`ngx_hash_add_key(&keys, &key_str, value_ptr, flags)`
  3. 构建哈希表：`ngx_hash_init(&hinit, keys.elts, keys.nelts)`
  4. 查找：`ngx_hash_find(hash, key, name, len)`
- **通配符匹配（如 `.example.org` 或 `foo.*`）**：
  - 使用 `NGX_HASH_WILDCARD_KEY` 标志
  - 分别初始化 `dns_wc_head` 和 `dns_wc_tail` 数组
  - 查找调用 `ngx_hash_find_combined(chash, key, name, len)`

## 决策指南
- **选择数组**：元素数量可预估且需连续内存访问
- **选择列表**：频繁追加且无法预估总量（如 HTTP 头）
- **选择队列**：需在结构体内嵌链表节点（如定时器、连接池）
- **选择红黑树**：需有序存储与范围查询（如变量缓存）
- **选择哈希表**：需快速精确或通配符匹配（如 server_name、map 指令）