# Solo play in production

## Context
Solo play was development-only (see [`2026-10-09-solo-play.md`](2026-10-09-solo-play.md)). Rémi wants it on the production site too, to play a mode alone.

## Decided
- The `import.meta.env.DEV` gates are removed on the client (home "Solo" button, `?solo` in the game URL) and in the Worker. Everything else is unchanged: `"both"` seat, seats tied to the token, white at the bottom.
- The server stays authoritative: `?solo` only gives the sides that are still free when the player joins. A visitor joining a game that already has a player cannot take the other player's side, so it cannot be used to hijack a game.
