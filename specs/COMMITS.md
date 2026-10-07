# Commit convention

**Gitmoji + Conventional Commits**, in English.

## Format

```
<gitmoji> <type>(<scope>): <description>

<optional body: the why, not the how>

<optional footer: BREAKING CHANGE, Co-Authored-By…>
```

Example: `✨ feat(modes): add the "mad king" mode`

### Subject line rules

- Starts with **exactly one gitmoji**, as a Unicode character (`✨`, not `:sparkles:`), picked from the table below according to the type.
- `type` lowercase, from the table. `scope` optional, see the list.
- Description in English, **imperative mood** ("add", "fix", "remove"), lowercase first letter, no trailing period.
- 72 characters max for the subject line.
- Breaking change: `!` after the scope (`♻️ refactor(protocol)!: …`), gitmoji 💥, and a `BREAKING CHANGE: <explanation>` footer.

### Body

Optional. Write one when the reason for the change is not obvious. Wrap at 72 characters, separated from the subject by a blank line.

## Types and gitmojis

| Gitmoji | Type | Use |
|---|---|---|
| ✨ | `feat` | new feature (including a new game mode) |
| 🐛 | `fix` | bug fix |
| 💄 | `style` | UI appearance (CSS, layout) |
| ♻️ | `refactor` | restructuring without behaviour change |
| ⚡️ | `perf` | performance |
| ✅ | `test` | adding or changing tests only |
| 📝 | `docs` | documentation, specs, README |
| 💭 | `docs` | ideation files in `history/` (scope `history`) |
| 📦️ | `build` | dependencies, build, `package.json` |
| 🔧 | `chore` | configuration (TypeScript, Wrangler, Vite, `.gitignore`, Claude tooling) |
| 🚀 | `ci` | deployment, continuous integration |
| ⏪️ | `revert` | reverting a previous commit |
| 💥 | (any type with `!`) | breaking change |
| 🎉 | `chore` | first commit of the project |

## Scopes

| Scope | Covers |
|---|---|
| `rules` / `engine` | rules engine and reusable building blocks |
| `modes` | game modes (name the mode in the description) |
| `server` | Worker, game room |
| `client` | React app |
| `protocol` | client ⇄ server messages |
| `specs` | `specs/` |
| `history` | `history/` |
| `deps` | dependencies |
| `config` | configuration files |

No scope when the commit touches the whole project.

## Splitting (`/commit` command)

- **One commit = one logical change.** Split by type, then by scope when the changes are independent.
- Tests go **with** the code they test (in the same `feat` or `fix`). The `test` type is for commits that only touch tests.
- The lockfile goes with the `package.json` change that caused it.
- Commit order: configuration and dependencies, then code (in dependency order: rules → protocol → server → client), then docs, specs and history.
- Never commit secrets (`.dev.vars`, tokens) or ignored generated files.
- Commits written by Claude end with Claude's `Co-Authored-By` line.
