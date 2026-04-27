---
name: blog-cover-image-prompt
description: >-
  Generates image-generation prompts for blog cover cards by analyzing article
  content. Outputs a ready-to-use prompt for Gemini 3 Pro (or similar models).
  Use when the user asks to create a blog cover image, generate a blog card
  illustration, or needs an image prompt for a technical blog post.
---

# Blog Cover Image Prompt Generator

## Goal

Analyze a blog article, extract its core narrative, and produce a polished
image-generation prompt that yields a **whiteboard-first hand-drawn cartoon blog card**
matching the EvoMap visual identity (see [reference.png](reference.png)).

The agent does **NOT** generate the image itself — it outputs a prompt for
human review, which is then fed into Gemini 3 Pro or a comparable model.

## Visual Style Reference

The target style (see `reference.png` in this directory) has these traits:

| Element | Description |
|---------|-------------|
| **Overall feel** | Hand-drawn sketch on a clean white / off-white background, like a whiteboard cartoon |
| **Characters** | Simple stick figures with round heads, minimal facial features, expressive poses |
| **Color palette** | Whiteboard-first: mostly white / off-white space with black ink outlines. Use golden yellow, amber, and orange only as small accent marks, never as an overall wash or background tint. Occasional green check marks or red highlights are fine. |
| **Typography** | Bold ALL-CAPS English headlines in a hand-lettered / marker style, placed at the top of the illustration |
| **Layout** | A single scene or a left-right "before → after" comparison; clear visual flow |
| **Objects** | Cartoon props: gears, speech bubbles, road signs, barriers, arrows, simple UI wireframes |
| **Mood** | Lighthearted, editorial, explanatory — like a visual analogy that makes a technical idea click |
| **Aspect ratio** | Landscape, roughly 16:9 or 2:1 |
| **No real photos** | Pure illustration; no photographic elements |

### Whiteboard Color Guardrails

Use `reference.png` for linework, layout density, character simplicity, and editorial cartoon mood. Do **not** copy any yellow cast from the reference into the whole image.

The image should read as a clean whiteboard sketch first:

- Keep the background white or very light cream, with no yellow-tinted full-card fill.
- Keep most large shapes unfilled or lightly filled with neutral off-white / pale gray.
- Reserve warm colors for small highlights: icons, arrows, warning marks, stickers, or one focal object.
- If the prompt mentions warm tones, immediately constrain them as "small accents only."

## Workflow

### Step 1 — Collect the Article

Ask the user for one of:

- A **URL** to the blog post (use `WebFetch` to retrieve content)
- A **local file path** (use `Read`)
- **Pasted content** in the chat

### Step 2 — Analyze the Article

Extract:

1. **Title** — the article's headline
2. **Abstract / Hook** — the opening 2-3 paragraphs that frame the problem or announcement
3. **Core Concept** — the single most important idea (one sentence)
4. **Key Sections** — list the 3-5 major sections with a one-line summary each
5. **Visual Metaphor Candidates** — brainstorm 2-3 everyday analogies or scenes that could visually represent the core concept (e.g., "factory assembly line → automated pipeline", "passport control → agent registration")

Present this analysis to the user in a concise summary block before proceeding.

### Step 3 — Generate the Prompt

Compose an image-generation prompt following this template structure:

```
A hand-drawn cartoon illustration in a clean whiteboard sketch style for a tech blog cover card.

Use the reference image for linework, simple stick-figure characters, and editorial composition only. Keep the overall image mostly white / off-white with black ink outlines; do not create a yellow-tinted background.

**Scene:** [Describe the scene — what is happening, who/what is in the frame]

**Headline text:** "[SHORT ALL-CAPS HEADLINE]" written in bold hand-lettered marker style at the top of the illustration.

**Characters:** Simple stick figures with round heads, minimal faces, and expressive body language. [Describe specific characters and what they're doing]

**Objects & props:** [List key visual elements — signs, arrows, gears, barriers, screens, etc.]

**Color palette:** Whiteboard-first palette: mostly white / off-white background, black ink outlines, and large areas left unfilled. Use golden yellow, amber, and orange only as small accent marks, not as a full-image tint. Occasional green (✓) or red highlights for emphasis.

**Layout:** [Describe spatial arrangement — single scene / left-right comparison / flow diagram]

**Style notes:** Editorial cartoon feel, lighthearted and explanatory. No photographic elements. Clean composition with breathing room. Landscape orientation (16:9).

**DO NOT include:** Realistic human faces, photographic textures, gradients, 3D rendering, dark backgrounds behind the illustration itself.
```

#### Prompt Writing Rules

- Keep the headline to **6 words or fewer**, ALL-CAPS English.
- The scene should tell a **mini-story** — a "before and after", a journey, or a single revealing moment.
- Prefer **concrete visual metaphors** over abstract diagrams.
- Name specific objects (e.g., "a wooden road sign reading 'CAPTCHA'" not "some barriers").
- Include at most **2 text labels** inside the illustration besides the headline.
- The prompt should be **self-contained** — someone with no context about the article should be able to picture the image.
- Preserve the **whiteboard feel**: explicitly say the image is mostly white / off-white with black linework, and limit warm colors to small accents.

### Step 4 — Present for Review

Output the final prompt inside a fenced code block so the user can copy it directly.

Add a brief note:

> 以上 Prompt 可直接粘贴到 Gemini 3 Pro 中使用。
> 如需调整视觉隐喻或构图方向，告诉我即可重新生成。

### Step 5 — 用 Gemini 3 Pro 生图

人工审核 Prompt 后，有两种方式生成最终封面图：

#### 方式 A：脚本自动生成（推荐）

本 Skill 自带生图脚本 `scripts/generate-cover.py`，零依赖（仅用 Python 标准库）。

**前置配置：** 确保 `GEMINI_API_KEY` 可用，二选一：
- 环境变量：`export GEMINI_API_KEY="your-key"`
- 在 Skill 目录下创建 `.env` 文件（参考 `.env.example`）

**基本用法：**

```bash
# 从 Prompt 文件生成
python scripts/generate-cover.py --prompt-file prompt.txt

# 直接传 Prompt 文本
python scripts/generate-cover.py --prompt "A hand-drawn cartoon illustration..."

# 附带参考风格图
python scripts/generate-cover.py --prompt-file prompt.txt --reference reference.png

# 自定义文件名（裸文件名会自动保存到 output/ 下）
python scripts/generate-cover.py --prompt-file prompt.txt --output blog-cover.png --size 2K --aspect 16:9
```

**参数说明：**

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--prompt` / `--prompt-file` | 必填 | Prompt 文本或文件路径 |
| `--reference` | 无 | 参考风格图片路径（可选，会作为输入图片发送给模型） |
| `--output` | `output/<YYYYMMDD-HHMMSS>-cover.png` | 输出图片路径；裸文件名会自动放入 `output/` |
| `--model` | `gemini-3-pro-image-preview` | 模型名称 |
| `--size` | `2K` | 分辨率：`512` / `1K` / `2K` / `4K` |
| `--aspect` | `16:9` | 宽高比 |

**输出规则：** 默认所有生成图写入 Skill 目录下的 `output/`。文件名以 `YYYYMMDD-HHMMSS` 开头，便于按名称排序和回溯生成时间。脚本会同时保存配套 Prompt 到同目录，例如 `20260427-152301-cover.png` 对应 `20260427-152301-cover-prompt.txt`。

**Prompt 文件规则：** Agent 在人工审核或 API 调用前需要落盘 Prompt 时，也统一写入 `output/`，使用 `YYYYMMDD-HHMMSS-<slug>-prompt.txt` 命名；不要把临时 Prompt 写在 Skill 根目录。

**Agent 集成工作流：** 当 Agent 生成 Prompt 并经人工确认后，直接在 Shell 中执行：

```bash
cd /path/to/skill-dir
python scripts/generate-cover.py --prompt-file /tmp/cover-prompt.txt --reference reference.png
```

#### 方式 B：手动粘贴到 AI Studio

1. 打开 [Google AI Studio](https://aistudio.google.com/)
2. 选择模型 **Gemini 3 Pro**（即 `gemini-3-pro-image-preview`）
3. 开启图片生成能力（确保勾选 "Generate images"）
4. 将审核后的 Prompt 整段粘贴发送
5. 不理想时可追加修改指令迭代
6. 下载图片，裁剪为 **1200×630 px**（OG image）或 **1920×1080 px**（16:9）

## Examples

### Case 1: AAEP — "冰山" 隐喻（成功案例）

**输入：** aaep.site — AI Architect Evolution Protocol，核心观点是"AI 再强，局部最优 ≠ 全局最优，做产品需要统一约束"

**核心挑战：** 这个概念很微妙——AI 工程师足够聪明，交付物表面看没问题，但内部架构接缝处藏着隐患。需要一个不需要解释就能秒懂的视觉隐喻。

**迭代过程（经验教训）：**

| 版本 | 思路 | 为什么不行 |
|------|------|-----------|
| v2 | 两半不同风格的房子拼接 | 太对称，冲突不够直观 |
| v3 | 4 种建筑风格拼成弗兰肯斯坦 | 太夸张，不符合事实——AI 够聪明，不会各搞各的 |
| v4 | 房子剖面图，外表完好内部混乱 | 需要理解建筑剖面，不够直觉化 |
| v5 | 房子从中间裂开的戏剧瞬间 | 太戏剧化，没传达"隐患"的感觉 |
| **v6** | **冰山：水上漂亮房子，水下结构混乱** | **一眼就懂，人人都知道冰山意味着什么** |

**关键转折：** 在 v5 之后停下来，先用文字重新梳理核心信息——"表面完美的房子，危险藏在看不见的地方"——然后才找到冰山这个人人秒懂的隐喻。**先对齐语义，再找视觉。**

**最终 Prompt：**

```
A hand-drawn cartoon illustration in a whiteboard sketch style for a tech blog cover card.

**Headline text:** "WHAT AI SHIPS vs WHAT LIES BENEATH" written in bold hand-lettered marker style at the top.

**Scene:** An iceberg diagram. A horizontal wavy blue waterline divides the image into two halves.

ABOVE the waterline: A beautiful, polished little house sits on top of the iceberg peak. It has clean off-white walls, neat windows with green shutters, a lightly accented amber roof, a small chimney, and a tiny garden with flowers. Three small stick-figure AI engineers stand on the iceberg surface next to the house, smiling and high-fiving each other. A small flag on the roof reads "v1.0". Everything above the waterline is clean, airy, and mostly whiteboard-like, with warm colors only as small highlights.

BELOW the waterline: The massive underwater portion of the iceberg is visible, and embedded inside it is the INTERNAL STRUCTURE of the house — a chaotic tangle that is much larger than the tidy house above. Misaligned foundation blocks sitting at different angles. Pipes and wires crossing each other in knots. Support beams that almost connect but leave small gaps between them. Arrows pointing in conflicting directions. Small crack lines running between the connection points of different sections. The internal mess is 3-4 times larger than the neat surface house, showing the true scale of hidden technical debt.

**Characters:** Three tiny stick figures above the waterline, celebrating with high-fives and smiles.

**Objects & props:** A neat small house on the iceberg peak. A "v1.0" flag. Below water: tangled pipes, misaligned blocks, gapped beams, crack lines, conflicting arrows.

**Color palette:** Whiteboard-first: mostly white / off-white background with black ink outlines. Above waterline: sparse amber, green, and sunshine-yellow accents only on the roof, flag, and small highlights. Below waterline: pale blue-gray ice with dark gray/brown structural elements tangled inside, plus small red crack marks at connection points. Avoid any full-image yellow tint.

**Layout:** Vertically split by the waterline at roughly 35% from the top. The small perfect house and tiny engineers sit in the top 35%. The massive tangled internal structure fills the bottom 65%.

**Style notes:** Editorial cartoon feel. The visual should read INSTANTLY — everyone knows what an iceberg means. Landscape 16:9.

**DO NOT include:** Multiple houses, cross-sections of walls, complex architectural labels. Keep it diagrammatic and clean. No photographic textures, no 3D rendering, no dark backgrounds.
```

**最终效果：** 见 [examples/aaep-iceberg.png](examples/aaep-iceberg.png)

### Case 2: Agent Self-Registration — "闯关" 隐喻

**输入：** "When Agents Get Their Own Accounts" — AI Agent 零人工注册账户

**最终 Prompt（参考风格图 reference.png 右侧卡片）：**

左到右闯关流：旧障碍（CAPTCHA / Email / Credit Card）→ API 网关 → 注册成功状态卡。直接映射真实业务流程，无需额外隐喻。

## Iteration Tips

迭代时的经验法则：

- **先对齐语义再找视觉** — 如果连续 2 版不满意，停下来用文字重新梳理核心信息
- **一个隐喻，一个焦点** — 最好的封面图只有一个视觉概念，不要塞太多元素
- **选人人秒懂的隐喻** — 冰山、天平、路口、拼图等通用隐喻 > 需要解释的专业图示
- **夸张要符合事实** — 隐喻可以简化，但不能扭曲核心观点的逻辑
- **Change metaphor**: 重新跑 Step 2 视觉隐喻头脑风暴
- **Adjust tone**: 更轻松 / 更严肃 / 更技术感
- **Multiple variants**: 一次生成 2-3 个 Prompt 变体供选择
