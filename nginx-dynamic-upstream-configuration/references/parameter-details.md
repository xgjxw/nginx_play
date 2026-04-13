# 参数详细说明

## 必需参数
- **upstream** (string): 上游服务器组名称

## 可选操作标志
- **stream**: 指定操作 Stream 类型上游组
- **add**: 触发添加服务器操作
- **remove**: 触发删除服务器操作

## 服务器属性参数
- **id** (integer): 服务器唯一标识符（用于删除或修改）
- **server** (string): 服务器地址（IP 或域名）
- **backup** (flag): 标记为备份服务器
- **weight** (integer): 权重值，默认为 1
- **max_conns** (integer): 最大并发连接数
- **max_fails** (integer): 失败次数阈值
- **fail_timeout** (time): 失败超时时间
- **slow_start** (time): 慢启动时间
- **down** (flag): 标记为不可用
- **up** (flag): 取消 down 状态
- **drain** (flag): 启用排水模式（仅 HTTP，1.7.5+）
- **route** (string): 路由字符串（HTTP）
- **service** (string): 服务名称（1.9.13+）

## 版本兼容性说明
- **backup= 参数**：在 1.7.2 之前，操作现有备份服务器时必须提供
- **域名自动更新**：仅在 1.7.2+ 版本支持
- **drain 模式**：仅在 1.7.5+ 版本支持
- **service 参数**：仅在 1.9.13+ 版本支持