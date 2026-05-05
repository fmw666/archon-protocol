# 产品需求文档 —— Archon Dashboard 视觉与交互重设计

> **范围说明**：这是项目特定的 PRD（不是框架文档），保留在 `docs/archon/adoption/` 内，因为 Dashboard 作为 Archon 的一个表面交付。框架可移植的 Dashboard 契约住在 `.archon/dashboard/`，不在此文档中。

![漫画图解：把 Archon Dashboard 白盒化](/images/dashboard-redesign-prd/01-whitebox-dashboard.png)

本 PRD 定义 Archon Dashboard 视觉与交互模型的下一次迭代：白盒化执行、治理资产实体化、并发会话管理、严格遵守 Light Voxel Brutalist。关于治理任意采用方项目的可移植 Dashboard 契约，见 `.archon/dashboard/`。

## 1. 产品总览

### 1.1 背景与目标

当前 Archon Dashboard 实现了零依赖与 SSE 实时刷新，但其视觉呈现与信息传达过于扁平 —— 它没有传达 Archon 硬核自主所有权的特质。

本次重设计的核心目标：

1. **白盒化执行** —— 实时可视化代理的思考、决策、工具调用；消除黑盒焦虑。
2. **资产实体化** —— 把抽象项目状态（进度、债务、知识、memo）变成干系人可浏览的具体「档案柜」。
3. **并发会话管理** —— 支持同时跑多个 Archon 进程（如两个并行需求），在 Dashboard 中无缝切换/监控它们。
4. **严格设计系统遵守** —— 按 `design-system` skill 完整应用 Light Voxel Brutalist。

### 1.2 目标用户

需要监督 Archon 工作状态、评审架构决策、检查项目健康的项目干系人（人类开发者 / 产品经理）。

---

## 2. 设计语言与视觉隐喻

严格遵循 `design-system` skill：

* **数字粗糙** —— 实色填充、不毛玻璃、不渐变。
* **结构诚实** —— 每个模块、卡片、按钮带 `border-2 border-black`（或更粗）实色黑边。
* **粉彩对比** —— 画布背景（`#f6f5f4`）；高亮与分类用低饱和粉彩（Lavender、Pink、Yellow、Mint、Sky）。
* **机械交互** —— 点击时硬阴影消失（`shadow-none`），元素物理位移（`translate-x-[4px] translate-y-[4px]`）。无平滑过渡；只有硬切。
* **字体** —— 标题与关键数字用像素字体 `VT323`；正文用 `Inter`。

---

## 3. 核心功能模块

### 3.1 多会话切换器

![漫画图解：多会话频道切换器](/images/dashboard-redesign-prd/02-session-channels.png)

**场景**：用户在终端 A 跑 `/archon-demand request-1`，同时在终端 B 跑 `/archon-demand request-2`。

* **视觉隐喻**：物理对讲机频道 / 街机投币槽。
* **位置**：顶部或左侧全局导航栏（*The Command Bar*）。
* **机制**：
  * **动态生成** —— 检测到新心跳注册时，导航栏「弹入」一个新频道标签页（带物理弹入动画）。
  * **状态指示灯** —— 每个频道标签页带像素状态灯：
    * 🟢 闪烁绿：`Running`（执行/思考中）。
    * 🟡 实心黄：`Idle/Waiting`（等待用户确认，如 prompt 模式 git commit）。
    * ⚪ 暗灰：`Stale/Dead`（心跳丢失）。
  * **信息显示** —— 频道标签页显示 Session ID（如 `#A7F2`）与截断的需求摘要（如 `Demand: optimize login...`）。
  * **交互** —— 点击频道标签页**硬切**主内容区到该会话的执行轨迹视图。

### 3.2 实时执行轨迹

![漫画图解：实时轨迹滚动条](/images/dashboard-redesign-prd/03-live-trace-ticker.png)

**场景**：用户点击活动会话以查看代理在做什么、想什么。

* **视觉隐喻**：老式收银小票 / 滚动终端日志（*The Ticker*）。
* **布局**：贯穿整页的纵向时间线（左侧粗黑线）；内容块向下追加；自动滚到最新记录。
* **细粒度事件胶囊**：
  1. **🧠 Reasoning** —— 浅灰背景卡，等宽字体，闪烁的 `>` 前缀。
  2. **📏 Rule Adoption** —— Lavender（`#e0d4ff`）胶囊，粗黑边；显示规则来源（如 `[frontend.mdc]`）与触发原因。
  3. **🛠️ Skill Invocation** —— Mint（`#b3ffe0`）胶囊，深硬阴影；显示 skill 名（如 `[design-system]`）与动作。
  4. **🚪 Decision Gate** —— Yellow（`#fff3b3`）高亮块。Veto 时边框转红，右上角出现红色 `[ VETO ]` 像素印章。
  5. **🤖 Subagent Spawn** —— 右缩进，展开倒置面板（纯黑 `#111111` 背景、绿色等宽文字）代表独立进程；显示子代理类型（如 `archon-capture-auditor`）与其独立输出流。

### 3.3 治理资产档案柜

![漫画图解：治理资产档案柜](/images/dashboard-redesign-prd/04-asset-cabinet.png)

**场景**：用户想宏观查看项目健康、进度、历史决策。

* **入口**：全局导航栏中的固定模块（与动态会话标签分开）。
* **子模块设计**：
  1. **🗺️ Milestones —— 建造看板**
     * 风格：超大矩形块。
     * 状态：进行中（黄黑斜条边、`border-4`）；完成（Mint 背景 + 黑色倾斜 `[ CLEARED ]` 印章）；未开始（虚线空心边）。
     * 内容：物理勾选框 `[X]` 显示特性验收与质量门状态。
  2. **🔴 Debt Tracker —— 通缉海报墙**
     * 风格：紧密排列的网格卡。
     * 层级：左侧粗彩色侧边带表示严重度（Critical 红色频闪、Warning 黄、Info 蓝）。
     * 字体：超大像素字体显示 ID（如 `DEBT-016`）；逾期日期为红。已解决卡变灰并盖绿色 `[ PAID ]` 章。
  3. **🧠 Knowledge Base —— 工具墙**
     * Rules：竖向高卡，顶部带黑色「夹子」图形（隐喻：强制约束）。
     * Skills：横向宽卡，极深硬阴影（隐喻：重型工具）。
     * ADRs：复古打孔卡风。被拒 ADR 带粗对角划线与红色 `[ VETOED ]` 印章。
  4. **💬 Memos —— 拍立得便签**
     * 风格：Yellow（`#fff3b3`）方卡，顶部带黑色像素「钉」图形。
     * 字体：左上角等宽日期，居中加粗结论，模拟手写便签。

---

## 4. 页面与信息架构

两个稳定区域：

| 区域 | 内容 | 行为 |
|--------|---------|----------|
| 全局顶导（*The Command Bar*） | 固定资产入口：概览、Milestones、Debt、Knowledge、Memos。动态会话标签：Session ID + 需求摘要 + 状态灯 | SSE 驱动会话标签的增删；点击硬切主内容区 |
| 主视口 | 固定资产视图或所选会话的实时执行轨迹 | 无柔和路由动画；视图切换必须保留机械齿轮咬合感 |

---

## 5. 交互与动画规范

1. **硬切** —— 禁止 `opacity` 渐隐或 `ease-in-out` 页面过渡。视图切换必须瞬时，可包含极短（50ms）1px X/Y 抖动模拟机械齿轮咬合。
2. **Brutal press** —— 每个可点击元素（标签、卡、按钮）`hover` 时仅改亮度（`brightness-95`）；`active`（按下）时阴影消失（`shadow-none`），元素位移（`translate-x-[4px] translate-y-[4px]`）。
3. **实时注入闪烁** —— 当 SSE 推送新数据（如新 Debt 条目，或轨迹中多一步推理）时，新 DOM 元素背景闪 Yellow（`#fff3b3`），300ms 内硬切回原色 —— 「数据物理拍进面板」的效果。
4. **自动滚动锁** —— 会话执行轨迹视图中，滚动默认钉在底部。用户向上滚时锁释放，浮现一个 `[ ↓ RESUME TRACKING ]` brutalist 按钮。

---

## 6. 数据源与技术约束

* **前端约束**：零依赖；纯 Vanilla JS + HTML + CSS。CSS 必须严格对齐项目的 design-system tokens（手写 class 或复用编译样式）。
* **数据驱动**：
  * 资产数据来自既有 `schema.js` 解析器（读 `manifest.md`、`debt.md`、`drift.md`、`.archon/decisions.md`）。
  * 多会话执行轨迹数据来自 `.cursor/archon/dashboard/heartbeats/*.json`。
* **SSE 契约**：后端 `server.js` 在心跳文件更新时必须触发 SSE `update` 事件；接收时前端重取 `/api/state` 并执行增量/完整视图重绘（接到实时注入闪烁动画）。
