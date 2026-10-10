// One room = one game. The server is authoritative: it validates every action
// with the game mode before broadcasting the new state.

import { Server, type Connection, type ConnectionContext } from "partyserver";
import type { Color, Seat } from "../core";
import { defaultMode, findMode, modes } from "../modes";
import type { ClientMessage, GameState, ServerMessage } from "../protocol";

// Rooms stored with an older format start a new game (no migration).
const VERSION = 2;

type Stored = {
  version: typeof VERSION;
  mode: string;
  state: unknown;
  tokens: Record<Color, string | null>; // each player's secret token, to get their side back
  names: Record<Color, string | null>;
};

type ConnState = { seat: Seat };

const COLORS: Color[] = ["w", "b"];

export class GameRoom extends Server<Env> {
  game: Stored = newGame(defaultMode.id);
  // False until the first connection, which picks the mode of a new room.
  created = false;

  async onStart() {
    const stored = await this.ctx.storage.get<Stored>("game");
    if (stored?.version === VERSION && findMode(stored.mode)) {
      this.game = stored;
      this.created = true;
    }
  }

  async onConnect(conn: Connection<ConnState>, { request }: ConnectionContext) {
    const params = new URL(request.url).searchParams;
    const token = params.get("token") ?? "";
    const name = (params.get("name") ?? "").trim().slice(0, 30) || "Anonyme";
    // Solo play (one player holds both sides) is only allowed in development.
    const solo = import.meta.env.DEV && params.has("solo");

    // The mode is fixed when the room is created: later connections can't change it.
    if (!this.created) {
      this.created = true;
      this.game = newGame((findMode(params.get("mode")) ?? defaultMode).id);
      await this.save();
    }

    const seat = await this.takeSeat(token, name, solo);
    conn.setState({ seat });
    send(conn, { type: "welcome", seat });
    this.broadcastState();
  }

  async onMessage(conn: Connection<ConnState>, raw: string | ArrayBuffer | ArrayBufferView) {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(String(raw));
    } catch {
      return;
    }
    if (msg?.type !== "action") return;

    const mode = modes[this.game.mode];
    const player = mode.toPlay(this.game.state);
    if (!player) return send(conn, { type: "error", message: "La partie est terminée." });
    const seat = conn.state?.seat;
    if (seat !== player && seat !== "both") {
      return send(conn, { type: "error", message: "Ce n'est pas votre tour." });
    }
    const next = mode.play(this.game.state, msg.action, player);
    if (!next) return send(conn, { type: "error", message: "Coup illégal." });

    this.game.state = next;
    await this.save();
    this.broadcastState();
  }

  async takeSeat(token: string, name: string, solo: boolean): Promise<Seat> {
    if (!token) return "spectator";
    const colors = COLORS.filter((color) => this.game.tokens[color] === token);
    // A new player takes the first free side, a solo player every free side.
    if (colors.length === 0 || solo) {
      const free = COLORS.filter((color) => !this.game.tokens[color]);
      for (const color of solo ? free : free.slice(0, 1)) {
        this.game.tokens[color] = token;
        colors.push(color);
      }
    }
    if (colors.length === 0) return "spectator";
    for (const color of colors) this.game.names[color] = name;
    await this.save();
    return colors.length === 2 ? "both" : colors[0];
  }

  save() {
    return this.ctx.storage.put("game", this.game);
  }

  broadcastState() {
    const state: GameState = { mode: this.game.mode, state: this.game.state, players: this.game.names };
    this.broadcast(JSON.stringify({ type: "state", state } satisfies ServerMessage));
  }
}

function newGame(mode: string): Stored {
  return {
    version: VERSION,
    mode,
    state: modes[mode].setup(),
    tokens: { w: null, b: null },
    names: { w: null, b: null },
  };
}

function send(conn: Connection, msg: ServerMessage) {
  conn.send(JSON.stringify(msg));
}
