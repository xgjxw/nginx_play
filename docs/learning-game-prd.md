# Nginx 学习型游戏重构 PRD

## 1. 项目定位

### 产品愿景
把当前的 `Nginx 要塞攻防战` 从“知识点塔防”重构为“基于真实配置、请求、日志和指标反馈的 Nginx 运维模拟游戏”，让新手在游玩中形成可迁移到真实工作场景的能力。

### 目标用户
- 完全不了解 Nginx 的新人
- 会写少量配置，但不理解行为因果的初级工程师
- 想通过交互式演练快速掌握排障和配置思路的 DevOps / 后端 / 运维学习者

### 学习结果
玩家完成前两章后，至少应具备以下能力：
- 能说清 `server`、`location`、`proxy_pass` 在做什么
- 能根据症状选择正确的配置修改方向
- 能通过 access log、error log、响应码和简单指标判断故障原因
- 能解释“为什么这个配置生效”和“为什么另一个写法会出错”

## 2. 现状诊断

### 当前仓库结构优势
- 根目录已有 80+ 个主题化 `SKILL.md`
- `index.md` 已经提供了技能索引
- HTML 导出页和 `skills-data.js.下载`、`enemies.js.下载`、`game.js.下载`、`ui.js.下载` 已经具备单页游戏骨架
- 每个技能基本都有明确的 `skillRef`，天然适合做内容映射

### 当前玩法问题
基于现有 [skills-data.js.下载](/D:/temp/Nginx%20%E4%B8%AD%E6%96%87%E6%96%87%E6%A1%A3%20(it-ebooks)%20(Z-Library).pdf/%E6%9E%B6%E6%9E%84%E5%B8%88%E4%B9%8B%E8%B7%AF%EF%BC%9ANginx%E8%A6%81%E5%A1%9E%E6%94%BB%E9%98%B2%E6%88%98_files/skills-data.js.%E4%B8%8B%E8%BD%BD) 和 [enemies.js.下载](/D:/temp/Nginx%20%E4%B8%AD%E6%96%87%E6%96%87%E6%A1%A3%20(it-ebooks)%20(Z-Library).pdf/%E6%9E%B6%E6%9E%84%E5%B8%88%E4%B9%8B%E8%B7%AF%EF%BC%9ANginx%E8%A6%81%E5%A1%9E%E6%94%BB%E9%98%B2%E6%88%98_files/enemies.js.%E4%B8%8B%E8%BD%BD) 的设计，当前系统主要有三个问题：

- 知识点被映射成攻击力、血量、减速等抽象效果，记住了名词，学不会因果。
- 关卡目标是“挡住怪”，不是“让请求正确处理并满足指标”。
- 玩家几乎不接触真实 Nginx 心智模型：请求流向、location 命中、头部传递、缓存命中、日志排障。

### 结论
保留“要塞攻防战”的包装和章节进度系统，但必须把核心循环从“放塔战斗”替换成“观察症状 -> 修改配置 -> 运行验证 -> 理解反馈 -> 复盘归因”。

## 3. 设计原则

- 真实语义优先：所有系统反馈都对应真实 Nginx 行为。
- 小步实验优先：每关只训练 1 到 2 个关键概念。
- 可观察性优先：玩家必须看到请求、响应、日志、拓扑和指标。
- 误区纠正优先：关卡专门打击新手常见误解，而不是只奖励正确答案。
- 复盘优先：通关后必须解释“为什么有效”和“为什么另一种写法不对”。

## 4. 核心玩法循环

### 单关循环
1. 接收任务
2. 查看业务背景和成功指标
3. 观察现象
4. 修改配置
5. 运行验证
6. 阅读反馈
7. 完成复盘

### 玩家在一关中会看到的对象
- 业务拓扑：浏览器、CDN、Nginx、上游应用、缓存层
- 请求样本：方法、路径、Host、头部、查询参数
- 响应结果：状态码、响应头、响应体摘要、耗时
- 日志面板：access log、error log、事件提示
- 指标面板：成功率、P95、缓存命中率、上游错误率、连接占用
- 配置面板：限定可编辑区域，而不是整份 `nginx.conf`

### 通关条件
不再以“清掉所有敌人”为主，而是以业务目标为主：
- 功能正确
- 错误率低于阈值
- 延迟符合目标
- 安全策略生效
- 配置风险不过线

## 5. 系统拆解

### 5.1 场景系统
每关都是一个真实场景：
- 首次部署站点
- `/api/` 反向代理
- `/chat/` WebSocket 升级失败
- 静态资源 gzip 不生效
- 缓存命中率过低
- 真实客户端 IP 丢失
- JWT 校验失败
- 上游故障转移

### 5.2 配置系统
配置系统不是自由文本 IDE，而是“三层编辑模式”：

- 初级模式：卡片拼装
  - 用于纯新手
  - 玩家选择 `proxy_http_version 1.1`、`proxy_set_header Upgrade` 这类配置卡
- 标准模式：半结构化编辑
  - 允许编辑指定 `server` / `location` / `upstream` 片段
  - 系统提供语法提示和局部 diff
- 高级模式：接近真实文本
  - 面向进阶玩家
  - 关卡允许修改完整片段并运行测试

### 5.3 验证系统
验证系统必须替代“战斗演算”成为核心：
- 单请求验证：检查单个样例请求是否命中预期
- 回归测试：一组隐藏用例检测边界情况
- 压测验证：模拟并发、缓存、连接占用变化
- 安全验证：模拟未授权请求、错误 token、伪造头部、盗链

### 5.4 反馈系统
每次点击“应用配置”后系统返回四类反馈：
- 功能反馈：请求是否成功
- 证据反馈：access / error log 发生了什么
- 路径反馈：请求命中了哪个 `location`，去了哪个 `upstream`
- 指标反馈：成功率、延迟、缓存命中率如何变化

### 5.5 复盘系统
每关通关后必须展示：
- 正确解的核心因果链
- 常见错误写法
- 为什么错误写法在这个场景下失败
- 对应 `SKILL.md` 阅读入口

### 5.6 进度系统
保留章节和关卡，但奖励要从“技能点”改为“能力解锁”：
- 解锁新的配置块
- 解锁新的观察面板
- 解锁更复杂的测试维度
- 解锁高阶模式

## 6. 内容结构

### 章节设计
第一章：请求到来
- `listen`
- `server_name`
- `location`
- 静态文件
- 默认页和错误页

第二章：反向代理
- `proxy_pass`
- URI 重写
- 请求头传递
- 超时和失败
- WebSocket

第三章：性能与缓存
- 并发与连接
- gzip
- buffering
- proxy cache
- FastCGI cache

第四章：安全与访问控制
- Basic Auth
- JWT
- TLS
- real IP
- secure link

第五章：上游与高可用
- upstream
- 负载均衡
- 健康检查
- 动态上游
- 故障转移

第六章：观测与排障
- access log
- error log
- 状态页
- reload / restart
- 典型线上事故

## 7. MVP 范围

### 目标
先验证“学习效果”，不是先追求“内容全覆盖”。

### MVP 只做 10 关
- 2 章内容
- 8 到 12 个核心概念
- 1 套最小可用模拟引擎
- 1 套复盘与错题系统

### MVP 必做功能
- 单关任务卡
- 限定区域配置编辑器
- 请求/响应查看器
- access log 和 error log 面板
- 配置验证器
- 自动测试运行器
- 关后复盘卡
- 技能文档跳转

### MVP 暂不做
- 排行榜
- 长线数值养成
- 复杂战斗特效
- 大量 decorative 动画
- 多人或 PVP

## 8. 数据模型重构

### 当前模型
当前模型主要是：
- `serverTypes`
- `modules`
- `globalTech`
- `enemyTypes`
- `LEVELS`

### 目标模型
重构后建议替换为以下内容模型：

#### `LESSON`
- `id`
- `chapter`
- `title`
- `summary`
- `difficulty`
- `sourceSkills`
- `prerequisites`

#### `SCENARIO`
- `persona`
- `businessContext`
- `topology`
- `trafficSamples`
- `initialConfig`
- `editableBlocks`
- `observability`

#### `OBJECTIVES`
- `mustPass`
- `scoreRules`
- `hiddenTests`
- `failureReasons`

#### `EXPLANATION`
- `whyItWorks`
- `commonMistakes`
- `wrongAnswerHints`
- `recommendedReading`

## 9. 现有技能文档到关卡的映射规则

每个 `SKILL.md` 不再只是说明书，而是内容素材源。提取规则如下：

### 从 `SKILL.md` 提取 5 类对象
- 概念对象：这个配置/模块解决什么问题
- 触发对象：什么场景下该想到它
- 操作对象：最小必要配置是什么
- 证据对象：成功或失败时通常会出现什么现象
- 限制对象：版本要求、模块要求、Plus 限制、常见坑

### 生成关卡时的落点
- `何时使用 / 适用条件` -> 任务背景和触发症状
- `核心操作步骤` -> 允许玩家选择或编辑的关键动作
- `配置示例` -> 标准答案或参考解
- `注意事项` -> 隐藏测试和错误答案提示
- `references/*.md` -> 进阶阅读和专家模式扩展

## 10. 实现架构建议

### 前端模块
- `mission-engine.js`
  - 管理任务状态、目标、评分、关卡切换
- `config-editor.js`
  - 负责配置片段编辑、提示、比对
- `nginx-sim.js`
  - 模拟请求匹配、代理、缓存、鉴权和验证逻辑
- `observability-panel.js`
  - 展示请求路径、日志和指标
- `lesson-review.js`
  - 输出复盘、错题和文档跳转

### 内容资产
- `content/lessons/*.json`
- `content/scenarios/*.json`
- `content/explanations/*.json`

### 对现有文件的迁移建议
- 保留 [架构师之路：Nginx要塞攻防战.html](/D:/temp/Nginx%20%E4%B8%AD%E6%96%87%E6%96%87%E6%A1%A3%20(it-ebooks)%20(Z-Library).pdf/%E6%9E%B6%E6%9E%84%E5%B8%88%E4%B9%8B%E8%B7%AF%EF%BC%9ANginx%E8%A6%81%E5%A1%9E%E6%94%BB%E9%98%B2%E6%88%98.html) 作为入口页
- 将 [skills-data.js.下载](/D:/temp/Nginx%20%E4%B8%AD%E6%96%87%E6%96%87%E6%A1%A3%20(it-ebooks)%20(Z-Library).pdf/%E6%9E%B6%E6%9E%84%E5%B8%88%E4%B9%8B%E8%B7%AF%EF%BC%9ANginx%E8%A6%81%E5%A1%9E%E6%94%BB%E9%98%B2%E6%88%98_files/skills-data.js.%E4%B8%8B%E8%BD%BD) 中的 `LEVELS` 拆成 `lessons.json`
- 将 [enemies.js.下载](/D:/temp/Nginx%20%E4%B8%AD%E6%96%87%E6%96%87%E6%A1%A3%20(it-ebooks)%20(Z-Library).pdf/%E6%9E%B6%E6%9E%84%E5%B8%88%E4%B9%8B%E8%B7%AF%EF%BC%9ANginx%E8%A6%81%E5%A1%9E%E6%94%BB%E9%98%B2%E6%88%98_files/enemies.js.%E4%B8%8B%E8%BD%BD) 的敌人概念改为 `trafficPatterns`
- 将 [game.js.下载](/D:/temp/Nginx%20%E4%B8%AD%E6%96%87%E6%96%87%E6%A1%A3%20(it-ebooks)%20(Z-Library).pdf/%E6%9E%B6%E6%9E%84%E5%B8%88%E4%B9%8B%E8%B7%AF%EF%BC%9ANginx%E8%A6%81%E5%A1%9E%E6%94%BB%E9%98%B2%E6%88%98_files/game.js.%E4%B8%8B%E8%BD%BD) 的战斗演算改为验证演算
- 将 [ui.js.下载](/D:/temp/Nginx%20%E4%B8%AD%E6%96%87%E6%96%87%E6%A1%A3%20(it-ebooks)%20(Z-Library).pdf/%E6%9E%B6%E6%9E%84%E5%B8%88%E4%B9%8B%E8%B7%AF%EF%BC%9ANginx%E8%A6%81%E5%A1%9E%E6%94%BB%E9%98%B2%E6%88%98_files/ui.js.%E4%B8%8B%E8%BD%BD) 保留章节/关卡/结算框架，替换中间主玩法区

## 11. 成功指标

### 学习指标
- 新手完成第 5 关后，能正确解释 `location` 与 `proxy_pass` 的作用
- 新手完成第 10 关后，能独立修复一个 WebSocket 升级问题
- 复盘题正确率逐章提升

### 产品指标
- 首日完成率
- 第 3 关和第 5 关通过率
- 单关平均复盘阅读率
- 文档跳转率
- 错题复刷率

## 12. 下一步执行建议

### 里程碑 1
- 先做 10 关学习型 MVP
- 不改视觉包装，只替换核心玩法

### 里程碑 2
- 让 `SKILL.md` 自动生成 lesson 数据
- 补上错题本和专家模式

### 里程碑 3
- 扩展到 30 关
- 加入高可用、安全和排障章节
