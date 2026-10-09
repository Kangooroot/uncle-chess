# CLAUDE.md

Always loaded (rules that apply to every task):

@specs/MAIN.md
@specs/WORKFLOW.md

## Read on demand

Read a spec only when the task touches its topic:

| Spec | Read before… |
|---|---|
| `specs/STACK.md` | touching dependencies, config, server, deployment, or running unusual commands |
| `specs/GAME-MODES.md` | working on game modes, the `GameMode` contract, or the protocol |
| `specs/ENGINE.md` | working on `src/core/`, `src/chess/`, `src/modes/`, or the engine migration |
| `specs/modes/<id>.md` | working on that game mode |
| `specs/COMMITS.md` | any commit |
| `history/README.md` | any topic: index of past decisions, then open only the relevant files |

## Essentials

- Yarn 4 only, never npm or npx (`yarn <script>`, `yarn dlx <pkg>`).
- Before pushing: `yarn typecheck`, `yarn lint`, `yarn format:check`, `yarn test`.
- Talk to the user in French, but write all code, comments, docs, specs, history files and commits in English. Exceptions in French: UI text, and pull request titles and descriptions.
