// Cloudflare Worker entry point. Static files (the client) are served
// directly by Cloudflare; only /parties/* requests (the rooms' WebSockets)
// reach this code.

import { routePartykitRequest } from "partyserver";

export { GameRoom } from "./GameRoom";

export default {
  async fetch(request, env) {
    return (await routePartykitRequest(request, env)) ?? new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
