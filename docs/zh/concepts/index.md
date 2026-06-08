# 核心概念

Archon 的「为什么」。读这些是为了理解框架相信什么、它如何建模认知循环，以及每条机制是为捕捉哪类具体陷阱而设计的。

## 阅读顺序

如果你有 **10 分钟**：只读 [10 分钟速览](/zh/concepts/overview)。

如果你有 **一小时**：按这个顺序读：

1. [10 分钟速览](/zh/concepts/overview) —— 系统的整体形状。
2. [五大支柱](/zh/concepts/five-pillars) —— 把首页的每条承诺（认知循环 · 机械闸门 · 持久状态 · 保全轴 · 所有权契约）逐条展开成它的核心思想**以及**实际强制它的那个已发布文件或契约条款。
3. [用户旅程](/zh/concepts/user-journeys) —— AI 辅助编码的 16 个真实陷阱，逐一映射到捕捉它们的机制。**这是体感"为什么"最强的一篇** —— 如果你想在投入之前先感受一下 Archon 与真实问题是否对齐，从这里开始。
4. [架构参考](/zh/concepts/architecture) —— 完整的结构性描述：认知循环 · 交付生命周期 · 约束金字塔 · 保留轴 · Claim Verifier · 子代理委派 · 状态记忆。
5. [架构决策](/zh/concepts/decisions) —— 按顺序的每一条 ADR，配上权衡与重新评估的触发条件。

如果你想看**为采用方项目所写的完整 Archon 引言**：[引言（完整 README）](/zh/concepts/introduction)。

## 深入主题

针对具体机制或比较：

| 页面 | 为什么你可能想读 |
|------|----------------------|
| [漂移机制](/zh/concepts/drift-mechanism) | 漂移计数器 · 机械保底 · 动态阈值 · 日志压缩各自如何工作。 |
| [模型 vs 鞍架](/zh/concepts/model-vs-harness) | 为什么更强的模型并不能免除对工程环境的需求。六问框架。 |
| [产品-架构工作流](/zh/concepts/product-architecture-workflow) | 产品视角的工作流：新项目接入 · 已有项目接管 · 需求执行边界。 |
| [超能力对照](/zh/concepts/superpowers-comparison) | 与 Superpowers 框架的对比分析 —— 反合理化、系统化调试、子代理成本意识。 |
| [重构与渐进采用](/zh/concepts/refactoring-adoption) | 提炼自重构纪律（两顶帽子 · 三次法则 · 渐进替换 · 节奏感 · 特征化测试）。 |

## 下一步

理解概念之后，去 [安装与启动](/zh/setup/) 把项目搭起来，或者直接跳到 [完整源码](/source/) 阅读 Archon 发行的每一个文件。
