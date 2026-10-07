# 2026-10-07 — Switch from npm to Yarn

## Context
Rémi wants Yarn used by default everywhere instead of npm.

## Decided
- **Yarn 4** (Berry, 4.18.1), pinned in the project: `packageManager` in `package.json`, release committed in `.yarn/releases/`, `yarnPath` in `.yarnrc.yml`. The global Yarn 1.22 on Rémi's machine delegates to it automatically; Corepack is not required.
- `nodeLinker: node-modules` instead of Plug'n'Play, because TypeScript 7 and Wrangler don't support PnP well.
- Yarn 4 disables install scripts by default: only `esbuild` and `workerd` are allowed, via `dependenciesMeta`.
- `@cloudflare/workers-types` re-added as a dev dependency to satisfy partyserver's peer dependency (it is not used in the tsconfigs; Worker types come from `wrangler types`).
- `package-lock.json` removed, replaced by `yarn.lock`. npm commands replaced in scripts and docs. Rule written in `specs/STACK.md`: always Yarn, `yarn dlx` instead of `npx`.

## Points of attention
- The npm workaround described in [`2026-10-07-vitest-5-upgrade.md`](2026-10-07-vitest-5-upgrade.md) (`npx npm@12 install`) no longer applies.
- A new dependency with an install script must be added to `dependenciesMeta` if it needs its script to work.
