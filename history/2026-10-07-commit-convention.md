# 2026-10-07 — Commit convention and /commit command

## Context
Rémi wants to simply type `/commit` and have Claude create clean commits, split by type of change, with a best-practice naming convention and a leading gitmoji.

## Decided (detailed in [`specs/COMMITS.md`](../specs/COMMITS.md))
- Format: `<gitmoji> <type>(<scope>): <description>`. Gitmoji + Conventional Commits. Rémi approved the idea.
- One Unicode gitmoji, determined by the type (mapping table). 💭 for `history/` files.
- Splitting: one commit = one logical change. Tests go with the tested code, lockfile with `package.json`.
- Command: project skill `.claude/skills/commit/SKILL.md`, user-triggered only.
- Language: first proposed with French descriptions, then switched to English (see [`2026-10-07-english-only.md`](2026-10-07-english-only.md)).

## Points of attention
- A leading gitmoji prevents standard Conventional Commits tools (commitlint, semantic-release) from parsing subjects without extra configuration. Not a problem as long as we don't use them.
- The stack section of `specs/MAIN.md` was moved to `specs/STACK.md`, and `CLAUDE.md` now imports `MAIN.md`, `STACK.md` and `GAME-MODES.md`.
