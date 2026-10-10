// The contract shared by every game of the platform, chess-based or not.
// Everything is pure and JSON-friendly: it runs in the browser and in the Worker.

export type Color = "w" | "b";
export type Square = string; // "a1" … "h8"
export type Dir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

// "both": one player holds both sides (solo play, development only).
export type Seat = Color | "both" | "spectator";

export type Status =
  | { kind: "playing" }
  | { kind: "win"; winner: Color; reason: string } // "checkmate", "repetition"…
  | { kind: "draw"; reason: string }; // "stalemate", "repetition", "fifty-moves", "material"…

export type ViewPiece = {
  color: Color;
  kind: string; // "k", "q", "r", "b", "n", "p", or a mode's own kind
  dir?: Dir; // pawn-like pieces: which way they move
};

export type BoardView = {
  pieces: Partial<Record<Square, ViewPiece>>;
  turn: Color | null;
  lastMove: { from: Square; to: Square } | null;
  check: Square[]; // royal pieces in check
};

export interface GameMode<State, Action> {
  id: string;
  name: string;
  description: string;
  /** Display text of each `Status` reason, e.g. `{ checkmate: "Checkmate" }`. */
  reasons: Record<string, string>;

  setup(): State;
  /** Plays an untrusted action. Returns the new state, or `null` if the action is malformed or illegal. */
  play(state: State, action: Action, player: Color): State | null;
  /** Who must play, `null` once the game is over. */
  toPlay(state: State): Color | null;
  status(state: State): Status;
  view(state: State, viewer: Seat): BoardView;
}

export function opponent(color: Color): Color {
  return color === "w" ? "b" : "w";
}
