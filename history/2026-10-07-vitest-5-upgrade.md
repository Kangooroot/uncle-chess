# 2026-10-07 — Vitest 5 upgrade

## Context
Once `vite.config.ts` (Vite 8) existed, Vitest 3 failed: it bundles Vite 7, which cannot load a Vite 8 config.

## Done
- Upgraded to Vitest 5 (supports Vite 8).
- npm 10.9 crashed while resolving Vitest 5's optional peer dependencies (`Cannot read properties of null (reading 'edgesOut')`). The lockfile was regenerated once with `npx npm@12 install`. Since then, the local npm 10 installs fine from that lockfile (`npm ci` and `npm install`).
- Added a separate `vitest.config.ts`: loading the Cloudflare Vite plugin inside Vitest fails ("There is already a server associated with the config"). Rules tests are pure TypeScript and need no plugin.

## Points of attention
- If adding or upgrading a dependency crashes npm 10 the same way, use `npx npm@12 install` (npm 12 blocks install scripts by default, run it only to regenerate the lockfile, then `npm ci` with the local npm).
- Updating Node to an LTS version (22 or 24) and npm would remove this workaround.
