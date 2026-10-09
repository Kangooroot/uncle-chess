// The chess family: state and the rules' extension points. State is plain
// JSON (stored in the Durable Object, sent over WebSocket); behaviour is plain
// objects of functions, composed with spread.

import type { Color, Dir, Square, Status } from "../core";

export type Piece = {
  type: string; // key in rules.pieces: "k", "q", "r", "b", "n", "p", or a mode's own type
  color: Color;
  moved: boolean; // castling rights (king, rook) and pawn two-square move
  dir?: Dir; // pawn-like pieces only
};

/** 64 squares, index = rank * 8 + file. */
export type Board = (Piece | null)[];

export type ChessState = {
  board: Board;
  turn: Color;
  enPassant: { target: Square; pawn: Square } | null; // skipped square, and the pawn to capture
  halfmoves: number; // since the last capture or pawn move (fifty-move rule)
  history: string[]; // position keys since the last irreversible move, current one included (repetition)
  lastMove: { from: Square; to: Square } | null;
  status: Status; // computed once per move by the ending rules
};

export type ChessAction = { from: Square; to: Square; promotion?: string };

/** Internal, richer form of a move. Squares are indices. */
export type ChessMove = {
  from: number;
  to: number;
  capture?: number; // square of the captured piece: `to`, or the pawn taken en passant
  rook?: { from: number; to: number }; // castling: the rook's own move
  enPassant?: { target: number; pawn: number }; // created by a two-square pawn move
  promotion?: Piece; // the piece that lands on `to`
};

export interface PieceKind {
  royal?: boolean; // must not be left in check (the king)
  /** Pseudo-legal moves, captures included. */
  moves(state: ChessState, from: number): ChessMove[];
  /** Squares it attacks (check, castling). */
  attacks(board: Board, from: number): number[];
}

export interface PromotionRule {
  /** Pieces a moving piece can turn into on `to`, the first one being the default. `null` = no promotion. */
  options(piece: Piece, to: number): Piece[] | null;
}

export interface CastlingRule {
  /** Pieces that king can still castle with some day, whatever the rest of the board (position key). */
  rights(board: Board, king: number): number[];
  /** Castling moves available to that king now. */
  moves(state: ChessState, king: number, attacked: (square: number, by: Color) => boolean): ChessMove[];
}

export type EndingContext = {
  legalMoves: ChessMove[]; // of the side to move
  inCheck: boolean; // is the side to move in check
};

export type EndingRule = (state: ChessState, context: EndingContext) => Status | null;

/** Start position. `placement` is a FEN placement; pawns ("p") get the direction of their side. */
export type Preset = { placement: string; pawnDirs: Record<Color, Dir>; turn: Color };

export interface ChessRules {
  setup: Preset;
  pieces: Record<string, PieceKind>;
  castling: CastlingRule | null;
  promotion: PromotionRule;
  endings: EndingRule[]; // checked in order after each move; the first match wins
}
