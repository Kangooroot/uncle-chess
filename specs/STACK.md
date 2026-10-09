# Tech stack

Decided on 2026-10-07 (see [`history/2026-10-07-stack-choice.md`](../history/2026-10-07-stack-choice.md)).

## Choices

| Layer | Technology | Role |
|---|---|---|
| Language | **TypeScript** | Everywhere: client, server, rules |
| Front end | **Vite + React** | Web app (2 screens: home, game) |
| Board | **react-chessboard** (MIT) | Board rendering and drag & drop |
| Rules | In-house engine (`src/core/`, `src/chess/`, `src/modes/`) | Every mode, classic included. See [`ENGINE.md`](ENGINE.md). chess.js is a dev dependency, used to test our classic rules |
| Real time | **Cloudflare Workers + Durable Objects** via `partyserver` / `partysocket` | One game = one `GameRoom` = one Durable Object |
| Hosting | **Cloudflare** (free tier) | Front end and server deployed together |
| Tests | **Vitest** | Rules engine tests (chess.js as the reference for classic chess) |
| Lint | **Oxlint** | ESLint-compatible rules, no dependency on TypeScript's JS API (typescript-eslint does not support TypeScript 7) |
| Formatting | **Prettier** | Code and config files, `printWidth` 120. Markdown is not formatted |
| Package manager | **Yarn 4** (`node-modules` linker) | Dependencies and scripts. Never npm |

Rejected: Next.js (too heavy, no WebSockets, SSR not needed), Supabase/Firebase, Socket.io on a VPS. Details in the history.

## Principles

- **The server is authoritative**: it validates every action with the rules engine before broadcasting it. The client runs the same code to show its own move immediately (optimistic display).
- **Shared rules**: the rules code runs identically in the browser and in the Worker. It must stay pure (no DOM, no Cloudflare APIs).
- **No accounts**: a nickname + a secret token in `localStorage`. The token lets a player get their side back after a refresh. A game is joined through a `/g/<id>` link. First to join = white, second = black, anyone else is a spectator.
- **No database**: a game's state is stored in its Durable Object.
- **Solo play, development only**: a game opened with `?solo` gives both sides to the same player, to test a mode alone. Gated by `import.meta.env.DEV` on the client and the server, so the production build drops it.

## Code layout

```
src/core/           GameMode contract, board geometry (shared by all games)
src/chess/          chess family engine and building blocks
src/modes/          game modes and their registry
src/server/         Worker (index.ts) and game room (GameRoom.ts)
src/client/         React app
src/protocol.ts     WebSocket messages client ⇄ server
wrangler.jsonc      Cloudflare config (Worker, Durable Object, static assets)
vite.config.ts      Vite config (React + Cloudflare plugins)
vitest.config.ts    Vitest config, separate: the Cloudflare plugin conflicts with Vitest
```

## Package manager

- **Always Yarn, never npm or npx**: `yarn install`, `yarn add [-D] <pkg>`, `yarn <script>`, `yarn <bin>` for a local binary (e.g. `yarn wrangler`), `yarn dlx <pkg>` instead of `npx`.
- Yarn 4.18 is pinned by `packageManager` in `package.json` and `yarnPath` in `.yarnrc.yml`, so a global Yarn 1 automatically delegates to it.
- `nodeLinker: node-modules` (not Plug'n'Play): TypeScript 7 and Wrangler don't support PnP well.
- Install scripts are disabled by default in Yarn 4. Packages that need them are allowed one by one in `dependenciesMeta` (`built: true`), currently `esbuild` and `workerd`.

## Commands

- `yarn dev`: front end and server, locally
- `yarn test`: tests
- `yarn lint`: Oxlint, warnings fail (`.oxlintrc.json`)
- `yarn format` / `yarn format:check`: Prettier, write or check
- `yarn typecheck`: type checking (`tsconfig.client.json` and `tsconfig.worker.json` are separate because browser and Worker global types are incompatible)
- `yarn deploy`: build and deploy to Cloudflare. Production is normally deployed by CI on merge to `main` (see [`WORKFLOW.md`](WORKFLOW.md)); run it by hand only in an emergency
- `yarn cf-types`: rerun after any change to `wrangler.jsonc`
