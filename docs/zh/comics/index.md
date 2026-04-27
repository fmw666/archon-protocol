# 漫画图解

这里是 AAEP 的漫画化架构专区，用更轻的叙事、分镜和图解，把协议中的抽象概念讲清楚。

适合放这些内容：

- 架构设计的分镜说明
- 复杂工作流的图解复盘
- Agent、Kernel、Driver、Syscall 等概念的角色化解释
- 真实案例截图和架构演进故事

## 连载目录

<div class="comic-grid">
  <a class="comic-card" href="/zh/comics/aaep-os-model">
    <span class="comic-card__eyebrow">第 1 话</span>
    <strong>AAEP 操作系统模型</strong>
    <p>把 AI Agent 想象成一台小型操作系统：内核常驻、驱动约束、系统调用触发工作流。</p>
  </a>
</div>

## 创作模板

每篇漫画建议保持同一种结构，方便读者快速进入语境：

1. **场景**：当前遇到的架构困惑是什么。
2. **角色**：谁在说话，比如 Agent、Kernel、Driver、User。
3. **冲突**：没有协议时会发生什么问题。
4. **图解**：用 Mermaid、截图或分镜图说明机制。
5. **落点**：这条机制在真实项目里解决了什么。

## 如何使用四格漫画 Skill

仓库内置了 `four-panel-comic-prompt`，用来把工程概念、架构说明或文档内容转换成竖版四格漫画 Prompt。它默认只生成 Prompt，不直接生图；当你确认 Prompt 后，再明确要求“生成图片”，Agent 才会调用 Gemini 图片 API。

常见用法：

```text
/four-panel-comic-prompt @docs/guide/user-journeys.md
```

也可以直接贴一个主题或粗略分镜：

```text
/four-panel-comic-prompt 解释“同一个概念被 AI 写成五种实现”的问题
```

Skill 会先提炼五件事：核心概念、错误做法、正确层级切换、AI Owner 的动作、系统结果。然后输出一段可复制到 Gemini 3 Pro 的英文生图 Prompt，结构固定为四格：

1. **Wrong approach**：局部最优或常见误区。
2. **Correct approach**：切换到更正确的工程视角。
3. **Action**：AI Owner 应用规则、工具或流程。
4. **System result**：系统变得更一致、更安全或更容易理解。

确认 Prompt 后，可以继续说“你来生成”。生成结果会保存到：

```text
.claude/skills/four-panel-comic-prompt/output/
```

文件名使用时间戳排序，例如：

```text
20260427-153000-pattern-drift-comic.png
20260427-153000-pattern-drift-comic-prompt.txt
```

四格漫画会复用 `single-comic-prompt` 的白板视觉风格：纯白或中性近白背景、黑色手绘线稿、简单角色、少量暖色点缀，避免整图发黄。
