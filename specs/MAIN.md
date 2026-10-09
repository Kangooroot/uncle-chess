# uncle-chess — Main specifications

A platform of chessboard-based game modes invented by my uncle. 1v1 multiplayer, in the browser.

## Language

- **Everything written is in English**: source code, identifiers, comments, UI text, docs, specs, `history/` files, commit messages, file names.
- **Conversations with Claude are in French.** Claude answers in French but writes every file and commit in English.

## Other specifications

- [`STACK.md`](STACK.md): tech stack, architecture principles, commands.
- [`GAME-MODES.md`](GAME-MODES.md): game modes, reusable building blocks, game mode contract.
- [`ENGINE.md`](ENGINE.md): engine architecture (core, chess family, modes) and migration plan.
- [`WORKFLOW.md`](WORKFLOW.md): branches and pull requests.
- [`COMMITS.md`](COMMITS.md): commit convention (gitmoji + Conventional Commits), used by `/commit`.
- `modes/<id>.md`: rules of each game mode.

## Ideation history

Keep track of our ideation for the whole project in the [`history/`](../history/) directory at the repository root.

- Whenever we discuss something worth noting (decision, game mode rule, idea, abandoned approach, open question…), or something that deserves Claude's attention in future prompts, add a summary in a **new** markdown file.
- Naming: `history/YYYY-MM-DD-short-topic.md` (e.g. `history/2026-10-07-history-setup.md`). Do not rewrite old files: if we change our minds, create a new file that references them.
- Content: context, what was decided or proposed, open questions, points of attention for later.
- Before working on a topic, read the relevant `history/` files.
