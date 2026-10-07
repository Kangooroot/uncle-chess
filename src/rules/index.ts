// Rules engine, shared by the client and the server.
// The rest of the app only talks to this module: the uncle's game modes
// are added here, without touching the server or the UI.

import { classic } from "./classic";

export type Color = "w" | "b";

export type Move = {
  from: string;
  to: string;
  promotion?: "q" | "r" | "b" | "n";
};

export type Status =
  | { kind: "playing" }
  | { kind: "checkmate"; winner: Color }
  | { kind: "draw"; reason: "stalemate" | "repetition" | "fifty-moves" | "material" };

export type Position = {
  fen: string;
  turn: Color;
  inCheck: boolean;
  status: Status;
};

export interface Variant {
  id: string;
  name: string;
  /** Position reached by playing `moves` from the initial position (moves assumed legal). */
  position(moves: Move[]): Position;
  /** Plays `move` after `moves`. Returns the new position, or `null` if the move is illegal. */
  play(moves: Move[], move: Move): Position | null;
}

export const variants: Record<string, Variant> = {
  [classic.id]: classic,
};

export const defaultVariant = classic;
