// Castling building blocks.

import { fileOf, offset, opponent, rankOf } from "../core";
import type { Board, CastlingRule, ChessMove } from "./types";

/**
 * Unmoved rooks ("r") of the king's side on its rank (and on its file if
 * `files`), if the king has not moved.
 */
function unmovedRooks(board: Board, king: number, files = false): number[] {
  const piece = board[king];
  if (!piece || piece.moved) return [];
  return board.flatMap((rook, sq) =>
    rook?.type === "r" &&
    rook.color === piece.color &&
    !rook.moved &&
    (rankOf(sq) === rankOf(king) || (files && fileOf(sq) === fileOf(king)))
      ? [sq]
      : [],
  );
}

/**
 * Classic castling: the king moves two squares towards an unmoved rook of its
 * rank, the rook jumps over it. Every square between them must be empty, and
 * the king must not be in check nor pass through an attacked square.
 */
export const standardCastling: CastlingRule = {
  rights: (board, king) => unmovedRooks(board, king),
  moves(state, king, attacked) {
    const { board, turn } = state;
    if (attacked(king, opponent(turn))) return [];
    const moves: ChessMove[] = [];
    for (const rook of unmovedRooks(board, king)) {
      const side = Math.sign(fileOf(rook) - fileOf(king));
      const to = king + 2 * side;
      const rookTo = king + side;
      if (to < 0 || to > 63 || rankOf(to) !== rankOf(king)) continue;

      const span = [king, rook, to, rookTo];
      let clear = true;
      for (let sq = Math.min(...span); sq <= Math.max(...span); sq++) {
        if (sq !== king && sq !== rook && board[sq]) clear = false;
      }
      // The king's arrival square is checked by the generic legality filter.
      if (clear && !attacked(rookTo, opponent(turn))) moves.push({ from: king, to, rook: { from: rook, to: rookTo } });
    }
    return moves;
  },
};

/**
 * Swap castling: the king and an unmoved rook of its rank or file swap
 * squares. Every square between them must be empty, and the king must not be
 * in check nor pass through an attacked square.
 */
export const swapCastling: CastlingRule = {
  rights: (board, king) => unmovedRooks(board, king, true),
  moves(state, king, attacked) {
    const { board, turn } = state;
    if (attacked(king, opponent(turn))) return [];
    return unmovedRooks(board, king, true).flatMap((rook) => {
      const df = Math.sign(fileOf(rook) - fileOf(king));
      const dr = Math.sign(rankOf(rook) - rankOf(king));
      for (let sq = offset(king, df, dr)!; sq !== rook; sq = offset(sq, df, dr)!) {
        if (board[sq] || attacked(sq, opponent(turn))) return [];
      }
      // The king's arrival square is checked by the generic legality filter.
      return [{ from: king, to: rook, rook: { from: rook, to: king } }];
    });
  },
};
