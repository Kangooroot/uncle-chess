// WebSocket messages exchanged between the client and the game room.

import type { Color, Move, Position } from "./rules";

export type Seat = Color | "spectator";

export type GameState = {
  variant: string;
  moves: Move[];
  position: Position;
  players: Record<Color, string | null>; // nicknames
};

export type ServerMessage =
  | { type: "welcome"; seat: Seat }
  | { type: "state"; state: GameState }
  | { type: "error"; message: string };

export type ClientMessage = { type: "move"; move: Move };
