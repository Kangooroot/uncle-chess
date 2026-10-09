# Lighter Claude context

## Context
Rémi wants to reduce his Claude token usage. Everything `CLAUDE.md` imports is loaded in every session: about 25 KB of specs (6 to 7k tokens), half of it `ENGINE.md`. `history/` (about 20 KB, growing) had to be scanned file by file to find relevant decisions.

## Decided
- `CLAUDE.md` only imports the rules that apply to every task: `specs/MAIN.md` and `specs/WORKFLOW.md`. The other specs are listed with **when to read them**.
- A few essentials stay inline in `CLAUDE.md`: Yarn only, the checks before pushing, the language rule.
- **`history/README.md`**: an index with one line per history file, and which file supersedes it. It is the only history file that gets edited (one line added per new file).

## Also discussed (not files)
- Biggest savings come from context size, not answer length: `/clear` between topics (one session per PR), `/compact` for long sessions, Sonnet for routine work and Opus for design, precise requests, quiet command outputs.
- Rémi may try the "caveman" tool for shorter answers.
