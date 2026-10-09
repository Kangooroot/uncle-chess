// The generic chess algorithm, driven by a `ChessRules`: legal moves, playing
// a move, position keys and endings. Knows nothing about any mode.

import { isSquare, opponent, toIndex, toSquare, type Color } from "../core";
import type { Board, ChessMove, ChessRules, ChessState, Piece, Preset } from "./types";

/** Board of a FEN-like placement (rank 8 first). Pawns ("p") get the direction of their side. */
export function parsePlacement({ placement, pawnDirs }: Pick<Preset, "placement" | "pawnDirs">): Board {
  const board: Board = Array(64).fill(null);
  placement.split("/").forEach((row, i) => {
    let file = 0;
    for (const char of row) {
      if (/\d/.test(char)) {
        file += Number(char);
        continue;
      }
      const color: Color = char === char.toUpperCase() ? "w" : "b";
      const type = char.toLowerCase();
      const piece: Piece = { type, color, moved: false };
      if (type === "p") piece.dir = pawnDirs[color];
      board[(7 - i) * 8 + file++] = piece;
    }
  });
  return board;
}

export function attacked(rules: ChessRules, board: Board, square: number, by: Color): boolean {
  return board.some((piece, sq) => piece?.color === by && rules.pieces[piece.type].attacks(board, sq).includes(square));
}

/** Squares of the royal pieces of `color` that are attacked. */
export function checkedRoyals(rules: ChessRules, board: Board, color: Color): number[] {
  return board.flatMap((piece, sq) =>
    piece?.color === color && rules.pieces[piece.type].royal && attacked(rules, board, sq, opponent(color)) ? [sq] : [],
  );
}

function applyToBoard(board: Board, move: ChessMove): Board {
  const next = board.slice();
  const piece = next[move.from]!;
  const rook = move.rook && next[move.rook.from];
  if (move.capture !== undefined) next[move.capture] = null;
  next[move.from] = null;
  if (move.rook) next[move.rook.from] = null;
  next[move.to] = move.promotion ?? { ...piece, moved: true };
  if (move.rook && rook) next[move.rook.to] = { ...rook, moved: true };
  return next;
}

/** Pseudo-legal moves of the side to move, plus castling, without those leaving a royal piece attacked. */
export function legalMoves(rules: ChessRules, state: ChessState): ChessMove[] {
  const { board, turn } = state;
  const candidates: ChessMove[] = [];
  board.forEach((piece, sq) => {
    if (piece?.color !== turn) return;
    const kind = rules.pieces[piece.type];
    for (const move of kind.moves(state, sq)) {
      const options = rules.promotion.options(piece, move.to);
      if (options) candidates.push(...options.map((promotion) => ({ ...move, promotion })));
      else candidates.push(move);
    }
    if (kind.royal && rules.castling) {
      candidates.push(...rules.castling.moves(state, sq, (square, by) => attacked(rules, board, square, by)));
    }
  });
  return candidates.filter((move) => checkedRoyals(rules, applyToBoard(board, move), turn).length === 0);
}

/** Plays a move, without updating `history` and `status` (see `settle`). */
export function makeMove(state: ChessState, move: ChessMove): ChessState {
  const piece = state.board[move.from]!;
  // Captures and pawn moves can't be undone: no earlier position can come back.
  const irreversible = move.capture !== undefined || piece.dir !== undefined;
  return {
    ...state,
    board: applyToBoard(state.board, move),
    turn: opponent(state.turn),
    enPassant: move.enPassant ? { target: toSquare(move.enPassant.target), pawn: toSquare(move.enPassant.pawn) } : null,
    halfmoves: irreversible ? 0 : state.halfmoves + 1,
    history: irreversible ? [] : state.history,
    lastMove: { from: toSquare(move.from), to: toSquare(move.to) },
  };
}

/**
 * Identifies a position for repetition: the pieces, the side to move, the
 * castling rights, and the en passant target only when it can be taken.
 * `moved` is left out, except through castling rights: a knight going back
 * and forth gives the same position again.
 */
function positionKey(rules: ChessRules, state: ChessState, moves: ChessMove[]): string {
  const { board } = state;
  const pieces = board.map((piece) => (piece ? `${piece.color}${piece.type}${piece.dir ?? ""}` : "")).join("/");
  const rights = board.flatMap((piece, sq) =>
    piece && rules.pieces[piece.type].royal && rules.castling ? rules.castling.rights(board, sq) : [],
  );
  const enPassant = moves.some((move) => move.capture !== undefined && move.capture !== move.to);
  return `${pieces} ${state.turn} ${rights.join(",")} ${enPassant ? state.enPassant?.target : "-"}`;
}

/** Records the position in `history` and computes `status` with the ending rules. */
export function settle(rules: ChessRules, state: ChessState): ChessState {
  const moves = legalMoves(rules, state);
  const settled = { ...state, history: [...state.history, positionKey(rules, state, moves)] };
  const context = { legalMoves: moves, inCheck: checkedRoyals(rules, state.board, state.turn).length > 0 };
  for (const ending of rules.endings) {
    const status = ending(settled, context);
    if (status) return { ...settled, status };
  }
  return { ...settled, status: { kind: "playing" } };
}

export function setup(rules: ChessRules): ChessState {
  return settle(rules, {
    board: parsePlacement(rules.setup),
    turn: rules.setup.turn,
    enPassant: null,
    halfmoves: 0,
    history: [],
    lastMove: null,
    status: { kind: "playing" },
  });
}

/** The legal move matching an untrusted action, or `null`. No `promotion`: the default option. */
export function findMove(rules: ChessRules, state: ChessState, action: unknown): ChessMove | null {
  if (typeof action !== "object" || action === null) return null;
  const { from, to, promotion } = action as Record<string, unknown>;
  if (!isSquare(from) || !isSquare(to)) return null;
  if (promotion !== undefined && typeof promotion !== "string") return null;
  const candidates = legalMoves(rules, state).filter((m) => m.from === toIndex(from) && m.to === toIndex(to));
  if (promotion === undefined) return candidates[0] ?? null;
  return candidates.find((m) => m.promotion?.type === promotion) ?? null;
}
