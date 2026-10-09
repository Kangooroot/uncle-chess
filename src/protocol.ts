// WebSocket messages exchanged between the client and the game room. They
// carry a mode's state and actions without interpreting them.

import type { Color, Seat } from "./core";

export type GameState = {
  mode: string;
  state: unknown; // the mode's state
  players: Record<Color, string | null>; // nicknames
};

export type ServerMessage =
  { type: "welcome"; seat: Seat } | { type: "state"; state: GameState } | { type: "error"; message: string };

export type ClientMessage = { type: "action"; action: unknown };
