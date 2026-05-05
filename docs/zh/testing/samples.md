---
title: 代表性样例
outline: deep
---

# 代表性样例

每一层 gate 都精选一个小样本。完整清单建议阅读 [Full Source](/source/) 页面。

## L1 样例 —— forbidden-substrings 检查

来自 `scripts/archon-check.py`：

```python
def assert_forbidden_substrings(root: Path, contract: dict[str, Any]) -> None:
    forbidden = contract.get("forbidden_substrings")
    if not forbidden:
        return
    files = list(forbidden.get("files", []))
    substrings = list(forbidden.get("substrings", []))
    violations: list[str] = []
    for rel_path in files:
        text = read_text(root, rel_path)
        for phrase in substrings:
            if phrase in text:
                violations.append(f"{rel_path}: forbidden substring {phrase!r}")
    if violations:
        fail("forbidden_substrings violated:\n  " + "\n  ".join(violations))
```

例如，用于防止宿主项目名称泄漏到 `docs/archon/CHANGELOG.md` 这类通用文件中（参见 [`contracts/governance-contract.yaml`](/source/contracts/governance-contract)）。

## L1 样例 —— Universal Module Guard

```python
def assert_universal_module_guard(root: Path, contract: dict[str, Any]) -> None:
    guard = contract.get("universal_module_guard")
    if not guard:
        return
    forbidden_terms = json_list_between_markers(
        read_text(root, guard["forbidden_terms_source"]),
        guard["forbidden_terms_marker"],
    )
    patterns = [(term, literal_token_pattern(term)) for term in forbidden_terms]
    # ...scan every file under `scan_paths`; any match fails the gate.
```

`forbidden_terms` 列表位于 `.archon/manifest.md` 中 `&lt;!-- archon-universal-forbidden-terms:start --&gt; ... :end --&gt;` 标记之间。采纳方在该处声明项目特有的术语，由 checker 强制执行。

## L2 样例 —— 导出契约测试

来自 `scripts/test-archon-export.mjs`：

```js
async function runPlatform(platformName) {
  const outputDir = path.resolve(ROOT, `.tmp-archon-export-${platformName}`)
  await runExportScript(outputDir, platformName)
  await assertBundledImagesListed(outputDir, platformName)
  await assertPlatformRewriteRoundTrip(outputDir, platformName)
  await assertRequiredFilesPresent(outputDir)
  await fs.rm(outputDir, { recursive: true, force: true })
}
```

从源仓库运行：

```bash
npm run archon:export:test
# [archon-export-test] Cursor and Claude Code bootstrap exports verified.
```

任何新增到打包文档中的图片，如果没有对应的 `DOC_ASSET_FILES` 条目，都会让这道 gate 失败。

## L3 样例 —— 项目 validate 流水线

采纳方项目接入自己的技术栈。典型布局如下：

```jsonc
{
  "scripts": {
    "validate": "npm run archon:records:check && npm run archon:check && npm run archon:verify && npm run archon:export:test && eslint . && tsc --noEmit && vitest run"
  }
}
```

这条链路是有意安排的：

1. **Records integrity** —— 从 records 重新生成 drift/debt/memos；若 hot 索引相对 records 已 drift，则失败。
2. **Contract** —— `archon-check.py`。
3. **Claim verifier** —— 遍历仓库，证明每一条承重的散文 claim 在机制上仍然成立。
4. **Export round-trip** —— 可选；只有你确实会重新导出时才有意义。
5. **Your own lint + typecheck + test** —— 在 `.archon/manifest.md` § Validation Command 中声明的产品侧验证。

## Pre-commit / pre-push 钩子

`.husky/pre-commit` 与 `.husky/pre-push` 运行该链路的子集：

```bash
# .husky/pre-commit (fast gates)
node scripts/archon-records.mjs check-all
python scripts/archon-check.py --root .

# .husky/pre-push (full chain)
npm run validate
```

Cursor 用户还可以选用 [`.cursor/hooks/archon-destructive-guard.mjs`](https://github.com/fmw666/archon-protocol/blob/main/docs/source-files/scripts/)，它会在破坏性 shell 命令进入终端前进行拦截（双层守卫，ADR-9）。
