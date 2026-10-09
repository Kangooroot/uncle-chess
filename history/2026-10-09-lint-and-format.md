# Lint and formatting

## Context
Before the engine migration (a big PR), Rémi asked for ESLint and Prettier with basic rules, so that the codebase stays clean from the start.

## Decided
- **Oxlint instead of ESLint.** The project uses TypeScript 7 (the native Go port), which no longer ships the classic JS API. typescript-eslint depends on it and only supports `typescript <6.1`. Running a second TypeScript 6 just for ESLint was rejected as fragile. Oxlint uses the same rule names as ESLint and its plugins, without depending on TypeScript.
- **Prettier** for formatting, `printWidth` 120 to match the existing code. **Markdown is not formatted**: `history/` files must never be rewritten, and specs are hand-written (tables).
- Oxlint rules: `correctness` as errors, `suspicious` as warnings, plus `eqeqeq`, `prefer-const`, React hooks rules, `no-explicit-any`, `consistent-type-imports`, `import/no-cycle`. Warnings fail `yarn lint` (`--deny-warnings`).
- CI runs `yarn lint` and `yarn format:check` along with typecheck and tests.
- VS Code: recommended extensions (Prettier, Oxc) and format on save, committed in `.vscode/`.

## Rejected
- Biome (one tool for lint and format): simpler, but further from the ESLint/Prettier ecosystem Rémi asked for.

## Later
- Oxlint's type-aware rules (built on TypeScript 7) could be enabled once stable, e.g. `no-floating-promises`.
- Revisit ESLint if typescript-eslint supports TypeScript 7.
