# Tech stack

Decided on 2026-10-07 (see [`history/2026-10-07-stack-choice.md`](../history/2026-10-07-stack-choice.md)).

## Choices

| Layer | Technology | Role |
|---|---|---|
| Language | **TypeScript** | Everywhere: client, server, rules |
| Front end | **Vite + React** | Web app (2 screens: home, game) |
| Board | **react-chessboard** (MIT) | Board rendering and drag & drop |
| Rules | **chess.js**, wrapped in `src/rules/` | Classic chess. See [`GAME-MODES.md`](GAME-MODES.md) for the move to in-house building blocks |
| Real time | **Cloudflare Workers + Durable Objects** via `partyserver` / `partysocket` | One game = one `GameRoom` = one Durable Object |
| Hosting | **Cloudflare** (free tier) | Front end and server deployed together |
| Tests | **Vitest** | Rules engine tests |

Rejected: Next.js (too heavy, no WebSockets, SSR not needed), Supabase/Firebase, Socket.io on a VPS. Details in the history.

## Principles

- **The server is authoritative**: it validates every action with the rules engine before broadcasting it. The client runs the same code to show its own move immediately (optimistic display).
- **Shared rules**: the rules code runs identically in the browser and in the Worker. It must stay pure (no DOM, no Cloudflare APIs).
- **No accounts**: a nickname + a secret token in `localStorage`. The token lets a player get their side back after a refresh. A game is joined through a `/g/<id>` link. First to join = white, second = black, anyone else is a spectator.
- **No database**: a game's state is stored in its Durable Object.

## Code layout

```
src/rules/          rules engine (shared by client and server)
src/server/         Worker (index.ts) and game room (GameRoom.ts)
src/client/         React app
src/protocol.ts     WebSocket messages client ⇄ server
wrangler.jsonc      Cloudflare config (Worker, Durable Object, static assets)
vite.config.ts      Vite config (React + Cloudflare plugins)
vitest.config.ts    Vitest config, separate: the Cloudflare plugin conflicts with Vitest
```

## Commands

- `npm run dev`: front end and server, locally
- `npm test`: tests
- `npm run typecheck`: type checking (`tsconfig.client.json` and `tsconfig.worker.json` are separate because browser and Worker global types are incompatible)
- `npm run deploy`: build and deploy to Cloudflare
- `npm run cf-types`: rerun after any change to `wrangler.jsonc`
