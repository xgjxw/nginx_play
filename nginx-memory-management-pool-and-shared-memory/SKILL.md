---
name: nginx-memory-management-pool-and-shared-memory
description: 在 Nginx 开发中，当需要动态分配内存或实现多进程间共享数据时，使用本技能选择合适的内存管理方式（系统堆、内存池或共享内存）并正确执行分配、使用与释放操作，以确保性能、安全性和资源生命周期可控。
---

# Nginx 内存管理模型（池与共享内存）

## 何时使用
- 在请求处理函数、模块初始化代码或共享数据结构中需要动态分配内存
- 需要在多个 Nginx 工作进程之间共享数据
- 不适用于栈上局部变量或全局静态内存场景

## 核心操作流程

### 1. 系统堆内存分配（基础但不推荐高频使用）
- 使用 `ngx_alloc(size, log)` 分配内存（带日志的 malloc 封装）
- 使用 `ngx_calloc(size, log)` 分配并清零
- 使用 `ngx_memalign(alignment, size, log)` 分配对齐内存
- 使用 `ngx_free(p)` 显式释放

> 仅在无法使用内存池或共享内存时使用，避免内存碎片和泄漏。

### 2. 内存池分配（Nginx 推荐方式）
- **创建池**：调用 `ngx_create_pool(size, log)`，其中 `size` 必须 ≥ `NGX_MIN_POOL_SIZE` 且为 `NGX_POOL_ALIGNMENT` 的倍数
- **分配内存**：
  - `ngx_palloc(pool, size)`：对齐分配
  - `ngx_pcalloc(pool, size)`：对齐分配并清零
  - `ngx_pnalloc(pool, size)`：未对齐分配（适用于字符串等）
- **释放内存**：
  - 调用 `ngx_destroy_pool(pool)` 自动释放池内所有内存
  - 对大块内存可单独调用 `ngx_pfree(pool, p)`
- **链式对象重用**：使用 `ngx_alloc_chain_link(pool)` 获取链节点，用 `ngx_free_chain(pool, cl)` 归还
- **注册清理回调**：通过 `ngx_pool_cleanup_add(pool, size)` 添加销毁时执行的清理函数

### 3. 共享内存（用于多进程间数据共享）
- **声明共享区域**：在配置阶段调用 `ngx_shared_memory_add(cf, name, size, tag)`，确保 `name` 唯一，`tag` 通常为模块地址
- **初始化回调**：实现 `shm_zone->init` 函数，在内存映射后执行初始化逻辑
- **使用 slab 分配器**：
  - 获取分配器：`(ngx_slab_pool_t *) shm_zone->shm.addr`
  - 分配：`ngx_slab_alloc(shpool, size)` 或 `ngx_slab_calloc(shpool, size)`
  - 释放：`ngx_slab_free(shpool, p)`
  - 注意：`size` 必须 ≥8 字节且为 2 的幂，否则自动向上取整
- **并发保护**：在访问共享数据前调用 `ngx_shmtx_lock(&shpool->mutex)`，完成后调用 `ngx_shmtx_unlock(&shpool->mutex)`

## 关键约束
- 内存池适用于请求或连接生命周期内的临时内存
- 共享内存必须通过 slab 分配器管理，不可直接使用 malloc/free
- 所有分配操作必须匹配对应的释放机制，避免跨类型混用