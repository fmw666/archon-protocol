# AI-Driven Documentation Automation

> **Purpose**: Guide for understanding the project's AI-driven documentation ecosystem
>
> **Audience**: Developers who want to learn this pattern and apply it to their own projects
>
> **Last Updated**: 2026-01-30

---

## The Paradigm: AI as Compiler, Prompt as Program

If we view **AI as a compiler/interpreter**, then the prompts and documentation architecture become a **programming language and program**. This project implements a complete "AI program" with its own syntax, runtime, and execution model.

### The Compilation Analogy

```mermaid
flowchart TB
    subgraph Traditional["Traditional Programming"]
        direction TB
        SC[Source Code<br/>.ts / .py] --> C[Compiler<br/>gcc, tsc]
        C --> E[Executable]
        E --> RR[Runtime Result]
    end
    
    subgraph AI["AI Programming"]
        direction TB
        P[Prompts<br/>.mdc / .md / SKILL.md] --> AI_E[AI Engine<br/>Claude, GPT]
        AI_E --> BO[Behavior + Output]
        BO --> DC[Documentation + Code]
    end
```

### Language Components Mapping

| Traditional Programming | AI Programming (This Project) | Location |
| ----------------------- | ----------------------------- | -------- |
| **Language Syntax** | Markdown + YAML frontmatter format | `.mdc`, `.md` |
| **Entry Point** (`main()`) | Rules with `alwaysApply: true` | `.cursor/rules/` |
| **Function Definitions** | Commands (user-invoked prompts) | `.cursor/commands/` |
| **Libraries/Modules** | Skills (reusable knowledge) | `.cursor/skills/`, `.claude/skills/` |
| **Import/Require** | `@see`, `@link`, file references | Within prompts |
| **Runtime Environment** | Documentation context (indexes, manifests) | `docs-site/` |
| **Memory/Heap** | AI context window + stored reports | `ai-reports/` |
| **Type System** | TSDoc annotations + JSON schemas | TSDoc tags, `manifest.json` |
| **Build Artifacts** | Generated documentation | `api-reference/` |
| **Persistent Storage** | Structure indexes, AI reports | `*-structure.md`, `ai-reports/` |

---

## Program Architecture

### The "AI Program" Stack

```mermaid
block-beta
    columns 1
    
    block:L5:1
        columns 3
        space:1 U["🎯 Layer 5: USER INTERFACE<br/>User Query (natural language)"] space:1
    end
    
    space
    
    block:L4:1
        columns 1
        R["⚙️ Layer 4: ALWAYS-ON RULES (Kernel)<br/>code-standards.mdc | tsdoc-standard.mdc<br/>structure-sync.mdc | ai-reports-storage.mdc"]
    end
    
    space
    
    block:L3:1
        columns 2
        CMD["📜 Commands<br/>/generate_api_docs<br/>/project_evaluation<br/>/skill_api_lookup"]
        SKL["🎯 Skills<br/>e2e-testing<br/>git-commit<br/>doc-writing"]
    end
    
    space
    
    block:L2:1
        columns 3
        IDX["📍 Structure Indexes<br/>code-structure.md<br/>docs-structure.md"]
        MAN["📋 API Manifest<br/>manifest.json"]
        HIS["📁 History<br/>ai-reports/"]
    end
    
    space
    
    block:L1:1
        columns 3
        AGT["agent/"]
        BAB["babylon/"]
        MON["monaco_editor/"]
    end
    
    U --> R
    R --> CMD
    R --> SKL
    CMD --> IDX
    SKL --> IDX
    IDX --> MAN
    MAN --> HIS
    HIS --> AGT
    HIS --> BAB
    HIS --> MON
```

**Layer Details:**

| Layer | Name | Components | Purpose |
| ----- | ---- | ---------- | ------- |
| 5 | User Interface | Natural language query | Entry point |
| 4 | Kernel Rules | `alwaysApply: true` rules | Behavioral constraints |
| 3 | On-Demand Modules | Commands + Skills | Task-specific knowledge |
| 2 | Runtime Context | Indexes + Manifest + Reports | Navigation & memory |
| 1 | Source Code | TypeScript with TSDoc | The actual codebase |

### Execution Model

```mermaid
flowchart TB
    subgraph P1["Phase 1: INITIALIZATION"]
        direction TB
        A1[Load Kernel Rules] --> A2[Parse Constraints]
        A2 --> A3["MUST: SRP, DRY, SOLID<br/>NEVER: God classes<br/>CHECK: Function length"]
    end
    
    subgraph P2["Phase 2: CONTEXT LOADING"]
        direction TB
        B1[User Query] --> B2{Need Navigation?}
        B2 -->|Yes| B3[Read code-structure.md]
        B2 -->|No| B4{Need Skill?}
        B4 -->|Yes| B5[Load SKILL.md]
        B4 -->|No| B6[Proceed]
    end
    
    subgraph P3["Phase 3: EXECUTION"]
        direction TB
        C1[Generate Code] --> C2[Check tsdoc-standard]
        C2 --> C3[Check code-standards]
        C3 --> C4[Check structure-sync]
    end
    
    subgraph P4["Phase 4: OUTPUT ROUTING"]
        direction TB
        D1{Output Type?}
        D1 -->|Code| D2[Source files]
        D1 -->|API docs| D3[api-reference/]
        D1 -->|Report| D4[ai-reports/]
        D1 -->|Index| D5[*-structure.md]
    end
    
    P1 --> P2
    P2 --> P3
    P3 --> P4
```

**Execution Phases:**

| Phase | Name | Actions |
| ----- | ---- | ------- |
| 1 | Initialization | Load `alwaysApply: true` rules, parse constraints |
| 2 | Context Loading | Lazy-load structure indexes, skills as needed |
| 3 | Execution | Generate output while checking all rule constraints |
| 4 | Output Routing | Route outputs to correct destinations |

---

## Language Specification

### Syntax: Rule Definition Language

Rules are the "kernel modules" of this AI program. They use a strict format:

**File structure:** `.cursor/rules/example-rule.mdc`

````yaml
---
description: Brief description (appears in AI context)
globs:                           # Scope control (like #ifdef)
  - "**/*.ts"
  - "**/*.tsx"
alwaysApply: true                # true = kernel, false = optional
---

# Rule Title (H1 = entry point)

## Trigger Conditions (when to activate)

| Condition | Action |
| --------- | ------ |
| X happens | Do Y   |

## Constraints (behavioral boundaries)

**[CONSTRAINTS]**
- MUST: Required behaviors (like assertions)
- NEVER: Forbidden behaviors (like type errors)
- CHECK: Validation requirements
**[/CONSTRAINTS]**

## Examples (training data)

**[EXAMPLE: good]**
✅ Correct behavior demonstration
**[/EXAMPLE]**

**[EXAMPLE: bad]**
❌ Incorrect behavior to avoid
**[/EXAMPLE]**
````

### Syntax: Command Definition Language

Commands are "functions" that users invoke explicitly:

**File structure:** `.cursor/commands/example-command.md`

````markdown
# Command Name

> Scope: When this command applies
> Goal: What this command achieves

---

## Role (function signature + docstring)

You are [role description with capabilities]

**[ROLE-PRINCIPLES]**
- Principle 1 (like function preconditions)
- Principle 2
**[/ROLE-PRINCIPLES]**

---

## Input (parameters)

**[ENV]**
Project: ${project_name}      # Injected variables
Date: ${date}
**[/ENV]**

**[USER-INPUT]**
${user_query}                  # User's actual request
**[/USER-INPUT]**

---

## Process (function body)

### Phase 1: [Step Name]
**[TASKS]**
- Task 1
- Task 2
**[/TASKS]**

### Phase 2: [Step Name]
...

---

## Output Format (return type)

**[OUTPUT-TEMPLATE]**
# Output Structure
...
**[/OUTPUT-TEMPLATE]**

---

## Constraints (assertions + error handling)

**[CONSTRAINTS]**
- MUST: ...
- NEVER: ...
**[/CONSTRAINTS]**
````

### Syntax: Skill Definition Language

Skills are "libraries" providing domain knowledge:

**File structure:** `.cursor/skills/example-skill/SKILL.md`

````markdown
# Skill Name

Brief description (like library README)

## When to Use (import conditions)

Use this skill when:
- Condition A
- Condition B

## Prerequisites (dependencies)

- Dependency 1
- Dependency 2

## Core Concepts (API documentation)

### Concept 1
Explanation...

### Concept 2
Explanation...

## Patterns (code examples)

### Pattern: [Name]
```
Example implementation
```

## Anti-Patterns (what not to do)

### Anti-Pattern: [Name]
❌ Why this is wrong...
````

---

## Module System

### Import/Export Model

**Implicit Imports (Always Available):**

| Module | Status |
| ------ | ------ |
| `code-standards.mdc` | ✅ Auto-loaded |
| `tsdoc-standard.mdc` | ✅ Auto-loaded |
| `structure-sync.mdc` | ✅ Auto-loaded |
| `ai-reports-storage.mdc` | ✅ Auto-loaded |

**Explicit Imports (On-Demand):**

| Method | Trigger | Example |
| ------ | ------- | ------- |
| User Command | `/command_name` | `/generate_api_docs` → loads `generate_api_docs.md` |
| Contextual Loading | Task detection | "Write E2E test" → loads `e2e-testing/SKILL.md` |
| Cross-Reference | `@see`, `@link` | "See tsdoc-standard.md" → AI follows link |

**Module Exports:**

| Module Type | Exports |
| ----------- | ------- |
| Rule | Constraints, triggers, behaviors |
| Command | Workflow, output format, execution steps |
| Skill | Domain knowledge, patterns, anti-patterns |
| Structure Index | Navigation paths, location mappings |
| Manifest | API definitions, type information |

### Dependency Graph

```mermaid
flowchart TB
    UQ[User Query] --> CS[code-standards.mdc]
    UQ --> TS[tsdoc-standard.mdc]
    UQ --> SS[structure-sync.mdc]
    UQ --> AR[ai-reports-storage.mdc]
    
    TS --> TSD[tsdoc-standard.md<br/>Full Spec]
    
    CS --> IDX[Structure Indexes<br/>code-structure.md<br/>docs-structure.md]
    TS --> IDX
    SS --> IDX
    
    IDX --> MAN[manifest.json<br/>API Type Information]
    
    MAN --> CMD[Commands<br/>on-demand]
    MAN --> SKL[Skills<br/>on-demand]
    MAN --> REP[ai-reports/<br/>history]
```

---

## Type System

### TSDoc as Type Annotations

In this AI program, TSDoc comments serve as **type annotations** that the AI uses to understand APIs:

```mermaid
flowchart LR
    subgraph S1["TypeScript Source"]
        TS["interface Entity {\l  id: string;\l  name: string;\l}"]
    end
    
    subgraph S2["TSDoc Annotations"]
        DOC["/** Entity in scene\l * @category Scene\l */\linterface Entity {\l  /** UUID v4 */ id\l  /** Display */ name\l}"]
    end
    
    subgraph S3["manifest.json"]
        JSON["Entity: {\l  category: Scene\l  id: string UUID\l  name: string display\l}"]
    end
    
    subgraph S4["AI Understanding"]
        KNOW["✓ Entity has id - UUID\l✓ Entity has name\l✓ Used for scene graph"]
    end
    
    S1 --> S2 --> S3 --> S4
```

**Type Information Flow:**

| Stage | Format | Purpose |
| ----- | ------ | ------- |
| Source Code | TypeScript types | Compile-time type safety |
| TSDoc Comments | Structured annotations | Human + AI readable |
| manifest.json | JSON index | AI retrieval |
| AI Understanding | Natural language | Code generation context |

### Category as Namespace

The `@category` tag functions like a **namespace** in traditional programming:

| @category | Namespace Purpose | Contains |
| --------- | ----------------- | -------- |
| `Entity` | Scene graph nodes | EntityData, createEntity, deleteEntity |
| `Component` | Entity attachments | ComponentData, addComponent, removeComponent |
| `Asset` | Project resources | AssetData, importAsset, listAssets |
| `Scene` | Scene management | SceneData, saveScene, loadScene |
| `Tools` | AI tool definitions | babylon_create_entity, babylon_get_scene |

---

## Memory Model

### Context Window as RAM

```mermaid
flowchart TB
    subgraph RAM["AI Context Window (~200K tokens)"]
        direction TB
        subgraph Stack["Stack (Active Processing)"]
            S1[Current user query]
            S2[Current file being edited]
            S3[Recent tool call results]
        end
        subgraph Heap["Heap (Loaded Context)"]
            H1[Always-on rules]
            H2[Loaded skills]
            H3[Loaded command prompts]
            H4[Read file contents]
            H5[Search results]
        end
    end
    
    subgraph Disk["Persistent Storage (Disk)"]
        direction TB
        subgraph Indexes["Structure Indexes"]
            I1[code-structure.md]
            I2[docs-structure.md]
            I3[manifest.json]
        end
        subgraph History["Historical Data"]
            D1[ai-reports/]
            D2[TSDoc in source]
            D3[api-reference/]
        end
    end
    
    RAM <-->|Read/Write| Disk
```

**Memory Access Pattern:**

| Condition | Action |
| --------- | ------ |
| Info needed | Check if in context (RAM) |
| In RAM | Use immediately |
| Not in RAM | Read from disk → Load into context → Use |

### Persistent State Management

**State Types:**

| State Type | Storage | Lifetime |
| ---------- | ------- | -------- |
| Session state | Context window | Single conversation |
| Project knowledge | Structure indexes | Until manually changed |
| API definitions | manifest.json | Until regenerated |
| Analysis history | ai-reports/ | Permanent (append-only) |
| Code documentation | TSDoc in source | With code lifecycle |

**Write Triggers:**

```mermaid
flowchart LR
    subgraph T1["Code Change"]
        CC[Code change] --> SS[structure-sync rule] --> UI[Update indexes]
    end
    
    subgraph T2["Analysis"]
        AC[Analysis done] --> AR[ai-reports rule] --> SR[Store report]
    end
    
    subgraph T3["API Docs"]
        GD[/generate_api_docs/] --> SC[Scan TSDoc] --> UA[Update api-reference]
    end
```

---

## Comparison: Traditional vs AI Programming

| Aspect | Traditional Programming | AI Programming (This System) |
| ------ | ----------------------- | ---------------------------- |
| **Compilation** | Source → Binary | Prompt → Behavior |
| **Type Safety** | Compiler enforces types | TSDoc + Rules enforce patterns |
| **Runtime Errors** | Exceptions, crashes | Wrong output, inconsistent behavior |
| **Debugging** | Debugger, stack traces | Read AI reasoning, check rule application |
| **Refactoring** | IDE tools, grep | AI applies rules automatically |
| **Documentation** | Generated from code | Generated AND guides AI |
| **Testing** | Unit tests, E2E | Prompt examples, constraint validation |
| **Version Control** | Git for source | Git for prompts + structure indexes |
| **Dependency Injection** | IoC containers | Skill loading, context injection |
| **Build Artifacts** | Binaries, bundles | Generated docs, reports |

---

## Overview

This project implements a **self-maintaining documentation system** where AI and documentation work together in a symbiotic loop:

```mermaid
flowchart TB
    DEV[👨‍💻 DEVELOPERS] -->|Write code with TSDoc| SRC[📄 SOURCE CODE<br/>with TSDoc comments]
    SRC -->|AI scans & generates| DOCS[📚 GENERATED DOCS<br/>• API Reference<br/>• Structure Index<br/>• AI Reports]
    DOCS -->|AI reads for context| AI[🤖 AI ASSISTANT<br/>Cursor / Continue]
    AI -->|Assists with coding<br/>Maintains docs| DEV
```

This creates three key benefits:

| Benefit | Description |
| ------- | ----------- |
| **Self-documenting** | TSDoc comments become the single source of truth for API docs |
| **Self-maintaining** | AI automatically updates structure indexes when code changes |
| **Self-aware** | AI reads generated docs to understand project context |

---

## System Architecture

### The Three Automation Loops

```mermaid
flowchart TB
    subgraph Loop1["Loop 1: TSDoc → API Reference"]
        direction LR
        SC1[Source Code<br/>TSDoc] -->|/generate_api_docs| API[api-reference/<br/>manifest.json]
        API -->|AI reads context| SC1
    end
    
    subgraph Loop2["Loop 2: Structure Change → Index Sync"]
        direction LR
        CH[Code/Doc Changes] -->|structure-sync.mdc| IDX[code-structure.md<br/>docs-structure.md]
        IDX -->|AI reads for nav| CH
    end
    
    subgraph Loop3["Loop 3: AI Output → Report Storage"]
        direction LR
        AN[AI Analysis] -->|ai-reports-storage.mdc| REP[ai-reports/<br/>auto-index]
        REP -->|Future AI reads| AN
    end
```

| Loop | Trigger | Output | Feedback |
| ---- | ------- | ------ | -------- |
| 1 | `/generate_api_docs` | api-reference/, manifest.json | AI reads for context |
| 2 | Code/Doc changes | Structure indexes | AI reads for navigation |
| 3 | AI analysis completed | ai-reports/ | Future AI reads for continuity |

---

## Component Overview

### 1. AI Configuration Layer (`.cursor/`)

The AI configuration layer defines rules, commands, and skills that control AI behavior.

```
.cursor/
├── rules/                    # Always-on rules (auto-applied)
│   ├── code-standards.mdc    # → Enforce code quality
│   ├── tsdoc-standard.mdc    # → Enforce TSDoc documentation
│   ├── ai-reports-storage.mdc# → Control report storage
│   ├── structure-sync.mdc    # → Trigger index updates
│   └── continuie.mdc         # → Protect Continue directory
│
├── commands/                 # User-triggered prompts
│   ├── generate_api_docs.md  # → /generate_api_docs
│   ├── project_evaluation.md # → /project_evaluation
│   └── skill_api_lookup.md   # → /skill_api_lookup
│
└── skills/                   # Reusable AI skills
    ├── e2e-testing/SKILL.md
    └── github-issue-creator/SKILL.md
```

| Type | Activation | Purpose |
| ---- | ---------- | ------- |
| **Rules** (`.mdc`) | Always applied | Enforce standards automatically |
| **Commands** (`.md`) | User invokes `/command_name` | Execute specific tasks |
| **Skills** (`SKILL.md`) | AI reads when relevant | Provide domain knowledge |

### 2. Documentation Site (`docs-site/`)

VitePress-based documentation with auto-discovery.

```
docs-site/
├── .vitepress/
│   ├── config.ts              # VitePress configuration
│   └── sidebar/
│       ├── index.ts           # Combines all sidebars
│       ├── guide.ts           # /guide/ sidebar
│       ├── developer-guide.ts # /developer-guide/ sidebar
│       ├── api-reference.ts   # /api-reference/ sidebar
│       └── ai-reports.ts      # /ai-reports/ sidebar (AUTO-SCAN)
│
├── guide/                     # User-facing documentation
├── developer-guide/           # Developer documentation
│   ├── code-structure.md      # 📍 Code structure index (AI-maintained)
│   ├── docs-structure.md      # 📍 Docs structure index (AI-maintained)
│   └── standards/             # Development standards
│
├── api-reference/             # 📍 Auto-generated from TSDoc
│   ├── _meta/
│   │   ├── manifest.json      # API index for AI context
│   │   └── source-map.json    # Doc ↔ source mappings
│   ├── babylon-editor/
│   ├── monaco-editor/
│   ├── agent/
│   └── shared/
│
└── ai-reports/                # 📍 AI-generated reports
    ├── code_quality_issues/   # Auto-discovered as sidebar section
    └── project_evaluation_reports/
```

### 3. Information Flow

```mermaid
flowchart LR
    subgraph Write["WRITE PHASE"]
        direction TB
        W1[Developer writes code] --> W2[AI enforces TSDoc]
        W2 --> W3[AI generates API docs]
        W3 --> W4[AI updates structure]
        W4 --> W5[AI stores reports]
    end
    
    subgraph Read["READ PHASE"]
        direction TB
        R1[AI reads rules] --> R2[AI reads structure indexes]
        R2 --> R3[AI reads manifest.json]
        R3 --> R4[AI reads past reports]
        R4 --> R5[VitePress auto-discovers]
    end
    
    Write --> Read
```

---

## Loop 1: TSDoc → API Reference

### Purpose

Convert source code comments into structured API documentation that both developers and AI can use.

### How It Works

```mermaid
flowchart LR
    SC["📄 Source Code\nwith TSDoc"] -->|/generate_api_docs| CMD["⚙️ Command\nProcessor"]
    CMD --> OUT
    
    subgraph OUT["📚 api-reference/"]
        direction TB
        O1["index.md"]
        O2["babylon-editor/"]
        O3["monaco-editor/"]
        O4["agent/tools/"]
        O5["_meta/"]
        O5a["manifest.json"]
        O5b["source-map.json"]
        O5 --> O5a
        O5 --> O5b
    end
```

### Key Components

| Component | Path | Purpose |
| --------- | ---- | ------- |
| TSDoc Rule | `.cursor/rules/tsdoc-standard.mdc` | Enforces TSDoc on all exports |
| TSDoc Standard | `docs-site/developer-guide/standards/tsdoc-standard.md` | Full documentation standard |
| Generation Command | `.cursor/commands/generate_api_docs.md` | Triggers API doc generation |
| API Output | `docs-site/api-reference/` | Generated documentation |
| Manifest | `api-reference/_meta/manifest.json` | API index for AI retrieval |

### Manifest.json Structure

The manifest serves as an AI-readable index of all APIs:

```json
{
  "version": "1.0.0",
  "generatedAt": "2026-01-27T12:00:00.000Z",
  "modules": {
    "babylon-editor": {
      "displayName": "Babylon Editor",
      "stats": { "types": 52, "functions": 48 },
      "categories": [
        { "name": "Entity", "count": 8 },
        { "name": "Component", "count": 6 }
      ]
    }
  },
  "globalIndex": {
    "types": {
      "EntityData": { "module": "babylon-editor", "path": "..." }
    },
    "tools": {
      "babylon_create_entity": { "group": "Entity", "brief": "..." }
    }
  }
}
```

### TSDoc Requirements

Every exported symbol MUST have:

| Tag | When Required | Example |
| --- | ------------- | ------- |
| `@param` | All parameters | `@param name - Entity display name` |
| `@returns` | Non-void returns | `@returns Created entity ID` |
| `@throws` | Can throw errors | `@throws {Error} When entity not found` |
| `@example` | Public APIs | Code example block |
| `@category` | All exports | `@category Entity` |

---

## Loop 2: Structure Change → Index Sync

### Purpose

Keep structure index documents (`code-structure.md`, `docs-structure.md`) synchronized with actual project structure.

### How It Works

```mermaid
flowchart LR
    CH["📝 Changes<br/>• Add file<br/>• Delete folder<br/>• Move module<br/>• Add rule"] --> RULE["⚙️ structure-sync.mdc<br/>(always-on)<br/>Triggers on:<br/>• New file<br/>• Delete dir<br/>• Rename<br/>• Restructure"]
    RULE --> IDX["📄 Updated Index<br/>code-structure.md<br/>docs-structure.md<br/>+ Date updated<br/>+ Tree updated<br/>+ Tables updated"]
```

### Trigger Conditions

| Category | Triggers |
| -------- | -------- |
| **Code Structure** | Add/delete/rename directories, Add important modules, Restructure files |
| **Docs Structure** | Add/delete/rename docs, Modify sidebar, Add rules/commands/skills |

### Structure Document Format

```markdown
# Project Code Structure Index

> **Purpose**: AI quick navigation
> **Maintainer**: AI (automatic)
> **Last Updated**: YYYY-MM-DD

## Directory Overview

\`\`\`
module/
+-- subfolder/
|   +-- file1.ts
|   +-- file2.ts
+-- index.ts
\`\`\`

| File | Description | AI Usage |
| ---- | ----------- | -------- |
| subfolder/ | 📁 Folder purpose | When to check |
| file1.ts | File purpose | When to check |
```

### Why This Matters

| Without Sync | With Sync |
| ------------ | --------- |
| AI reads outdated index | AI reads accurate index |
| ↓ AI navigates to wrong location | ↓ AI finds correct location |
| ↓ AI generates incorrect code | ↓ AI generates correct code |
| ↓ **Developer fixes AI mistakes** | ↓ **Developer ships faster** |

---

## Loop 3: AI Output → Report Storage

### Purpose

Ensure all AI-generated analysis, reports, and documentation are stored in discoverable locations.

### How It Works

```mermaid
flowchart LR
    REP["📊 AI generates report<br/>• Code review<br/>• Architecture<br/>• Evaluation<br/>• Refactoring"] --> RULE["⚙️ ai-reports-storage.mdc<br/>(always-on)<br/>Decision flow:<br/>1. Scan dirs<br/>2. Match or create<br/>3. Store"]
    RULE --> OUT["📁 ai-reports/<br/>Sidebar auto-discovers<br/>new directories<br/>(ai-reports.ts scans at build)"]
```

### Storage Decision Flow

```mermaid
flowchart TB
    START[AI generates report] --> SCAN[Scan ai-reports/ directories]
    SCAN --> EXISTS{Appropriate<br/>dir exists?}
    EXISTS -->|YES| STORE1[Store in existing dir]
    EXISTS -->|NO| JUSTIFY{New category<br/>justified?}
    JUSTIFY -->|YES| CREATE[Create new dir + index.md]
    CREATE --> STORE2[Store document]
    JUSTIFY -->|NO| ROOT["Store at root<br/>⚠️ NOT RECOMMENDED"]
```

### Directory Categories

| Directory | Contents | File Naming |
| --------- | -------- | ----------- |
| `code_quality_issues/` | SRP violations, refactoring reports | `ISSUE_XXX_description.md` |
| `project_evaluation_reports/` | Architecture reviews, audits | `YYYY-MM-DD_HH-mm.md` |
| `security_audits/` | Security reviews (suggested) | `YYYY-MM-DD_topic.md` |
| `optimization_suggestions/` | Performance reports (suggested) | `descriptive-name.md` |

### Sidebar Auto-Discovery

The `ai-reports.ts` sidebar configuration dynamically scans the `ai-reports/` directory:

```typescript
// Simplified from docs-site/.vitepress/sidebar/ai-reports.ts
function buildAiReportsSidebar() {
  const entries = fs.readdirSync(AI_REPORTS_DIR)
  
  for (const entry of entries) {
    if (isDirectory(entry)) {
      // Creates collapsible section with all .md files
      sidebar.push({
        text: `📂 ${formatTitle(entry)}`,
        items: scanDirectory(entry)
      })
    }
  }
  
  return sidebar
}
```

---

## AI Context Flow

### How AI Gains Project Understanding

```mermaid
flowchart TB
    subgraph Step1["Step 1: Rules Auto-Applied"]
        R1["code-standards.mdc → Code quality"]
        R2["tsdoc-standard.mdc → Documentation"]
        R3["structure-sync.mdc → Index updates"]
        R4["ai-reports-storage.mdc → Output storage"]
    end
    
    subgraph Step2["Step 2: Structure Index Reading"]
        Q1["Where is X?"] --> CS[code-structure.md] --> NAV[Navigate to location]
        Q2["Where to put Y?"] --> DS[docs-structure.md] --> STORE[Store appropriately]
    end
    
    subgraph Step3["Step 3: API Context Retrieval"]
        Q3["How do I create entity?"] --> MAN[manifest.json]
        MAN --> FIND[Find: babylon_create_entity]
        FIND --> READ[Read: agent/tools/...]
        READ --> GEN[Generate: Correct tool call]
    end
    
    subgraph Step4["Step 4: Historical Context"]
        Q4["Continue previous refactoring"] --> REP[ai-reports/]
        REP --> HIST[Find: ISSUE_001_*.md]
        HIST --> RESUME[Resume: Work from where left off]
    end
    
    Step1 --> Step2
    Step2 --> Step3
    Step3 --> Step4
```

**Context Acquisition Steps:**

| Step | Input | Action | Output |
| ---- | ----- | ------ | ------ |
| 1 | Session start | Load kernel rules | Behavioral constraints |
| 2 | "Where is X?" | Read structure indexes | Navigation paths |
| 3 | "How to use API?" | Query manifest.json | API definitions |
| 4 | "Continue task" | Read ai-reports/ | Historical context |

---

## Configuration Reference

### Rule Configuration Format (`.mdc`)

```yaml
---
description: Brief description of the rule
globs:                           # Files that trigger this rule
  - "**/*.ts"
  - "**/*.tsx"
alwaysApply: true                # Always apply (vs. manual trigger)
---

# Rule Title

Rule content in markdown...
```

### Command Configuration Format (`.md`)

````markdown
# Command Name

> Scope: When to use this command
> Goal: What this command achieves

---

## Role

You are [role description]...

---

## Input

**[ENV]**
Project: ${project_name}
Date: ${date}
**[/ENV]**

---

## Process

### Phase 1: ...
### Phase 2: ...

---

## Output Format

[Template for output]

---

## Constraints

**[CONSTRAINTS]**
- MUST: ...
- NEVER: ...
**[/CONSTRAINTS]**
````

### Skill Configuration Format (`SKILL.md`)

```markdown
# Skill Name

Brief description of what this skill enables.

## When to Use

- Condition 1
- Condition 2

## How to Use

Step-by-step instructions...

## Examples

Example usage...
```

---

## Implementation Checklist

### Setting Up AI-Driven Documentation

| Step | Action | Verification |
| ---- | ------ | ------------ |
| 1 | Create `.cursor/rules/` directory | Directory exists |
| 2 | Add `tsdoc-standard.mdc` with enforcement rules | Rule auto-applies |
| 3 | Add `structure-sync.mdc` with trigger conditions | Indexes update on changes |
| 4 | Add `ai-reports-storage.mdc` with storage rules | Reports stored correctly |
| 5 | Create `docs-site/developer-guide/code-structure.md` | AI can navigate code |
| 6 | Create `docs-site/developer-guide/docs-structure.md` | AI can navigate docs |
| 7 | Create `docs-site/api-reference/_meta/manifest.json` | AI has API index |
| 8 | Configure sidebar auto-discovery | New directories appear |
| 9 | Add `/generate_api_docs` command | API docs regeneratable |
| 10 | Test full loop with a code change | Everything syncs |

### Verification Commands

```bash
# Check rule files exist
ls .cursor/rules/*.mdc

# Check structure documents exist
ls docs-site/developer-guide/code-structure.md
ls docs-site/developer-guide/docs-structure.md

# Check manifest exists
cat docs-site/api-reference/_meta/manifest.json | head -20

# Check sidebar auto-discovery
ls docs-site/ai-reports/

# Build and verify
npm run docs:build
```

---

## Best Practices

### For Developers

| Practice | Why |
| -------- | --- |
| Always write TSDoc for exports | AI generates accurate API docs |
| Use `@category` tags consistently | API docs are organized logically |
| Include `@example` for public APIs | AI learns correct usage patterns |
| Update structure indexes after refactoring | AI maintains accurate navigation |

### For AI Rules

| Practice | Why |
| -------- | --- |
| Use `alwaysApply: true` for critical rules | Rules apply without manual trigger |
| Be specific with glob patterns | Rules apply only where needed |
| Include examples in rules | AI learns from examples |
| Keep rules focused (single responsibility) | Easier to maintain and debug |

### For Commands

| Practice | Why |
| -------- | --- |
| Define clear output format | Consistent, predictable results |
| Include constraints section | Prevent common mistakes |
| Provide good/bad examples | AI learns boundaries |
| Use phases for complex workflows | AI follows structured process |

---

## Troubleshooting

### AI Not Following Rules

| Symptom | Cause | Solution |
| ------- | ----- | -------- |
| Rule not applied | Missing `alwaysApply: true` | Add to frontmatter |
| Rule partially applied | Glob pattern too narrow | Expand glob patterns |
| Rule conflicts | Multiple rules contradict | Review and consolidate |

### Structure Index Out of Sync

| Symptom | Cause | Solution |
| ------- | ----- | -------- |
| AI navigates to wrong location | Index not updated | Manually update index |
| New modules not found | Not added to index | Add new entries |
| Date not updated | Forgot to update | Update "Last Updated" |

### API Docs Not Generated

| Symptom | Cause | Solution |
| ------- | ----- | -------- |
| Missing documentation | No TSDoc comments | Add TSDoc to exports |
| Wrong categorization | Missing `@category` | Add category tags |
| Not in manifest | Generation not run | Run `/generate_api_docs` |

---

## Summary

The AI-driven documentation system creates a self-maintaining ecosystem:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         KEY TAKEAWAYS                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. TSDoc is the source of truth                                     │
│     - Write once in code, appears everywhere                         │
│     - AI generates API docs automatically                            │
│     - manifest.json enables AI retrieval                             │
│                                                                      │
│  2. Structure indexes enable navigation                              │
│     - AI reads indexes before exploring                              │
│     - Always sync indexes with actual structure                      │
│     - Enables AI to find anything quickly                            │
│                                                                      │
│  3. Rules enforce consistency                                        │
│     - alwaysApply rules run automatically                            │
│     - No human oversight needed                                      │
│     - AI maintains its own documentation                             │
│                                                                      │
│  4. Reports create institutional knowledge                           │
│     - All AI analysis is preserved                                   │
│     - Future AI sessions can read history                            │
│     - VitePress auto-discovers new content                           │
│                                                                      │
│  Result: Documentation that maintains itself                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Related Documentation

| Document | Purpose |
| -------- | ------- |
| [TSDoc Standard](./standards/tsdoc-standard.md) | Full TSDoc specification |
| [AI Reports Standard](./standards/ai-reports-standard.md) | Report storage rules |
| [Code Structure Index](./code-structure.md) | Navigate code modules |
| [Docs Structure Index](./docs-structure.md) | Navigate documentation |
| [Git Commit Standard](./standards/git-commit-standard.md) | Commit message format |
