---
name: Nginx状态数据版本兼容性分析
description: 根据Nginx软件版本、状态数据集版本和是否为商业订阅，判断状态接口中哪些字段应存在或缺失。当解析Nginx状态数据（如通过stub_status或API）并发现字段与预期不符时使用本技能。
---

# Nginx状态数据版本兼容性分析

## 何时使用
- 解析Nginx状态数据（如`/api/`或`/status`端点）时
- 遇到字段缺失、异常或不确定是否应存在时
- 需验证某功能（如`upstreams.header_time`或`zombies`）在当前部署中是否可用
- 区分开源版与商业订阅版的功能差异

## 执行步骤

1. **确认基础信息**：
   - 获取Nginx软件版本（如`1.20.1`）
   - 获取状态数据中的`version`字段（整数，当前最高为8）
   - 确认是否为商业订阅版本（`is_commercial`）

2. **按状态数据版本检查字段可用性**：
   - **v2+**：应包含`server_zones`、`caches`、`load_timestamp`
   - **v3+**：应包含`upstreams.id`、`max_conns`、`caches.revalidated`
   - **v4+**：应包含`upstreams.selected`、`draining`状态
   - **v5+**：应包含`version`、`generation`、`processes.respawned`、`upstreams.header_time/response_time`；**移除**`upstream keepalive`字段
   - **v6+**：应包含SSL状态、`server_zones.discarded`、`queue`状态、`pid`；`zombies`字段在正式版中可用
   - **v7+**：应包含`sessions`状态、`stream server_zones.discarded`
   - **v8+**：应包含`http/stream upstreams.zone`、`slabs`状态、`checking`状态、`upstreams.name/service`、`nginx_build`、`ppid`

3. **验证商业订阅特有功能**（即使版本满足，若非商业版则不可用）：
   - 动态可配置组（需`resolver + zone`）
   - `health_checks`相关字段（如`unhealthy`, `last_passed`）
   - `least_time`负载均衡的时间字段（1.11.6前仅商业版支持）
   - `sticky`指令（`learn`/`route`方法）、`ntlm`、`queue`等

4. **处理调试版差异**：
   - 若`status_data_version < 6`且为调试构建，`zombies`字段可能存在；正式版中该字段仅在v6+出现

5. **字段缺失处理**：
   - 若当前`status_data_version`低于某字段引入版本，则该字段**不应出现在响应中**
   - 若字段存在但版本不匹配，标记为异常或忽略

> 注意：商业功能需额外验证许可证有效性，仅版本达标不足以保证字段存在。