# uncle-chess

Chessboard-based game modes invented by my uncle, playable 1v1 in the browser.

## Development

This project uses **Yarn 4** (pinned in `.yarn/releases/`, no global install needed beyond any `yarn`). Do not use npm.

```sh
yarn install
yarn dev           # http://localhost:5173: front end + game server, locally
yarn test          # rules engine tests
yarn typecheck
```

To play locally: create a game, then open the link in another browser (or a private window).

## Deployment

```sh
yarn wrangler login # once
yarn deploy
```

After changing `wrangler.jsonc`, regenerate the types: `yarn cf-types`.

## Layout

- `src/rules/`: rules engine and game modes (shared by client and server)
- `src/server/`: Cloudflare Worker and game room (Durable Object)
- `src/client/`: React app
- `src/protocol.ts`: WebSocket messages
- `specs/`, `history/`: specifications and ideation history
