// Movement building blocks. A piece kind is an object of functions, so a mode
// can derive its own with spread: `{ ...pawn, royal: true }`.

import { DIRS, offset, step, toIndex, type Dir } from "../core";
import type { Board, ChessMove, PieceKind } from "./types";

export const ORTHOGONAL: Dir[] = ["n", "s", "e", "w"];
export const DIAGONAL: Dir[] = ["ne", "nw", "se", "sw"];
export const ALL_DIRS: Dir[] = [...ORTHOGONAL, ...DIAGONAL];

/** Moves to every attacked square that does not hold a piece of the same side. */
function movesTo(board: Board, from: number, targets: number[]): ChessMove[] {
  const color = board[from]?.color;
  const moves: ChessMove[] = [];
  for (const to of targets) {
    const target = board[to];
    if (!target) moves.push({ from, to });
    else if (target.color !== color) moves.push({ from, to, capture: to });
  }
  return moves;
}

/** Slides any number of squares in `dirs`, until blocked (rook, bishop, queen). */
export function slider(dirs: Dir[]): PieceKind {
  return {
    attacks(board, from) {
      const squares: number[] = [];
      for (const dir of dirs) {
        for (let sq = step(from, dir); sq !== null; sq = step(sq, dir)) {
          squares.push(sq);
          if (board[sq]) break;
        }
      }
      return squares;
    },
    moves(state, from) {
      return movesTo(state.board, from, this.attacks(state.board, from));
    },
  };
}

/** Jumps to fixed file and rank offsets (knight, king). */
export function leaper(offsets: [number, number][]): PieceKind {
  return {
    attacks(_board, from) {
      return offsets.map(([df, dr]) => offset(from, df, dr)).filter((sq) => sq !== null);
    },
    moves(state, from) {
      return movesTo(state.board, from, this.attacks(state.board, from));
    },
  };
}

export const knight = leaper([
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
  [-2, 1],
  [-1, 2],
]);

export const king: PieceKind = { ...leaper(ALL_DIRS.map((dir) => [...DIRS[dir]])), royal: true };

/**
 * Pawn, written relative to the piece's own `dir`: one step forward, two while
 * it has not moved, captures one square diagonally forward, en passant.
 * Promotion is the job of the rules' `PromotionRule`.
 */
export const pawn: PieceKind = {
  attacks(board, from) {
    const dir = board[from]?.dir;
    if (!dir) return [];
    const [df, dr] = DIRS[dir];
    // The two diagonals around an orthogonal direction: add its perpendiculars.
    return [offset(from, df + dr, dr + df), offset(from, df - dr, dr - df)].filter((sq) => sq !== null);
  },
  moves(state, from) {
    const { board, enPassant } = state;
    const piece = board[from];
    if (!piece?.dir) return [];
    const moves: ChessMove[] = [];

    const one = step(from, piece.dir);
    if (one !== null && !board[one]) {
      moves.push({ from, to: one });
      const two = step(one, piece.dir);
      if (!piece.moved && two !== null && !board[two]) {
        moves.push({ from, to: two, enPassant: { target: one, pawn: two } });
      }
    }

    for (const to of this.attacks(board, from)) {
      const target = board[to];
      if (target) {
        if (target.color !== piece.color) moves.push({ from, to, capture: to });
      } else if (enPassant && toIndex(enPassant.target) === to) {
        const victim = toIndex(enPassant.pawn);
        if (board[victim] && board[victim].color !== piece.color) moves.push({ from, to, capture: victim });
      }
    }
    return moves;
  },
};
