# 2026-10-07 — Everything written in English

## Context
Until now, specs, history, comments and UI text were in French.

## Decision
- **All written artifacts are in English**: source code, identifiers, comments, UI text, docs, specs, history files, commit messages, file names.
- **Conversations between Rémi and Claude stay in French.**
- The rule is in `specs/MAIN.md` (Language section) and recalled in `CLAUDE.md`.

## Applied
- Every existing file was translated, including the earlier history files. They were also renamed to English. This is an exception to the "do not rewrite old history files" rule: only the language changed, not the content.
- The commit convention now uses English imperative descriptions ("add", "fix").
- The game UI (texts shown to players) is now in English too.

## Points of attention
- If French-speaking players (e.g. the uncle) need a French UI, add proper internationalization (i18n) rather than hard-coding French strings.
