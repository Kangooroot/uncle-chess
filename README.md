# uncle-chess

Chessboard-based game modes invented by my uncle, playable 1v1 in the browser.

## Development

```sh
npm install
npm run dev        # http://localhost:5173: front end + game server, locally
npm test           # rules engine tests
npm run typecheck
```

To play locally: create a game, then open the link in another browser (or a private window).

## Deployment

```sh
npx wrangler login # once
npm run deploy
```

After changing `wrangler.jsonc`, regenerate the types: `npm run cf-types`.

## Layout

- `src/rules/`: rules engine and game modes (shared by client and server)
- `src/server/`: Cloudflare Worker and game room (Durable Object)
- `src/client/`: React app
- `src/protocol.ts`: WebSocket messages
- `specs/`, `history/`: specifications and ideation history
