# 2026-10-07 — Tech stack choice

## Context
Goal: an alternative chess game (the uncle's variants), 1v1 multiplayer, playable in the browser. Requirements: modern technologies, as simple as possible to implement.

## Validated needs
- **Matchmaking**: private link (one player creates the game and shares the URL). No lobby, no queue.
- **Persistence**: no accounts, just a nickname. The game state is kept on the server and survives a refresh.
- **Rules**: close to classic chess (8x8, classic pieces, a few modified rules).
- **Language / hosting**: TypeScript everywhere, free and simple hosting.

## Decisions
- **Front end**: Vite + React + TypeScript.
- **Board**: `react-chessboard` (MIT). Chessground rejected because of its GPL license.
- **Rules**: `chess.js` wrapped in an in-house `src/rules/` module, shared by client and server. The rest of the app only depends on this module, so chess.js can be replaced by an in-house engine if a variant requires it.
- **Real time + state**: Cloudflare Workers + Durable Objects via `partyserver` / `partysocket` (PartyKit's successor). One game = one room = one Durable Object. The server is authoritative: it validates moves, then broadcasts the state.
- **Hosting**: Cloudflare (free tier). A single deployment (`wrangler deploy`) for front end and server.
- **Tests**: Vitest for `src/rules/`.

## Rejected options
- **Next.js**: too heavy for this use. It does not handle WebSockets (a separate real-time server would be needed anyway), SSR and SEO are useless here (two fully interactive screens), and it complicates hosting on Cloudflare (OpenNext adapter). To reconsider only if a real website grows around the game (public pages, accounts, rankings).
- **Supabase / Firebase**: move validation would happen on the client or require separate functions.
- **Socket.io on a VPS**: a server to maintain.

## Points of attention
- Side assignment: first to join = white, second = black, anyone else is a spectator. A token in `localStorage` lets a player get their side back after a refresh.
- The uncle's rules have not been described yet. They will go in `src/rules/` (topic to document separately).
