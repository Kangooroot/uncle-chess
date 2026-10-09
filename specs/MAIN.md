# uncle-chess — Main specifications

A platform of chessboard-based game modes invented by my uncle. 1v1 multiplayer, in the browser.

## Language

- **Everything written is in English**: source code, identifiers, comments, docs, specs, `history/` files, commit messages, branch names, file names.
- **Two exceptions, in French**:
  - **UI text** (everything shown to players: labels, statuses, error messages sent by the server, mode names and descriptions, ending reasons). Hard-coded in French for now; a translation system may come later.
  - **Pull request titles and descriptions.**
- **Conversations with Claude are in French.** Claude answers in French but writes every file and commit in English, except the two cases above.

Decided on 2026-10-07, UI and pull requests switched to French on 2026-10-09 (see [`history/2026-10-09-french-ui.md`](../history/2026-10-09-french-ui.md)).

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
- Every new file gets a one-line entry in [`history/README.md`](../history/README.md), the index. It is the only history file that gets edited.
- Before working on a topic, read the index, then only the relevant `history/` files.
