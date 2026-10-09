// One room = one game. The server is authoritative: it validates every move
// with the rules engine before broadcasting the new state.

import { Server, type Connection, type ConnectionContext } from "partyserver";
import type { ClientMessage, GameState, Seat, ServerMessage } from "../protocol";
import { defaultVariant, variants, type Color, type Move } from "../rules";

type Stored = {
  variant: string;
  moves: Move[];
  tokens: Record<Color, string | null>; // each player's secret token, to get their side back
  names: Record<Color, string | null>;
};

type ConnState = { seat: Seat };

const COLORS: Color[] = ["w", "b"];

export class GameRoom extends Server<Env> {
  game: Stored = {
    variant: defaultVariant.id,
    moves: [],
    tokens: { w: null, b: null },
    names: { w: null, b: null },
  };

  async onStart() {
    const stored = await this.ctx.storage.get<Stored>("game");
    if (stored) this.game = stored;
  }

  async onConnect(conn: Connection<ConnState>, { request }: ConnectionContext) {
    const params = new URL(request.url).searchParams;
    const token = params.get("token") ?? "";
    const name = (params.get("name") ?? "").trim().slice(0, 30) || "Anonymous";
    // Solo play (one player holds both sides) is only allowed in development.
    const solo = import.meta.env.DEV && params.has("solo");

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
    if (msg.type !== "move") return;

    const variant = variants[this.game.variant];
    const position = variant.position(this.game.moves);
    const seat = conn.state?.seat;
    if (seat !== position.turn && seat !== "both") {
      return send(conn, { type: "error", message: "It's not your turn." });
    }
    if (!variant.play(this.game.moves, msg.move)) {
      return send(conn, { type: "error", message: "Illegal move." });
    }

    this.game.moves.push(msg.move);
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
    const state: GameState = {
      variant: this.game.variant,
      moves: this.game.moves,
      position: variants[this.game.variant].position(this.game.moves),
      players: this.game.names,
    };
    this.broadcast(JSON.stringify({ type: "state", state } satisfies ServerMessage));
  }
}

function send(conn: Connection, msg: ServerMessage) {
  conn.send(JSON.stringify(msg));
}
