// Castling building blocks.

import { fileOf, opponent, rankOf } from "../core";
import type { Board, CastlingRule, ChessMove } from "./types";

/** Unmoved rooks ("r") of the king's side on its rank, if the king has not moved. */
function unmovedRooks(board: Board, king: number): number[] {
  const piece = board[king];
  if (!piece || piece.moved) return [];
  const rooks: number[] = [];
  for (let sq = rankOf(king) * 8; sq < rankOf(king) * 8 + 8; sq++) {
    const rook = board[sq];
    if (rook?.type === "r" && rook.color === piece.color && !rook.moved) rooks.push(sq);
  }
  return rooks;
}

/**
 * Classic castling: the king moves two squares towards an unmoved rook of its
 * rank, the rook jumps over it. Every square between them must be empty, and
 * the king must not be in check nor pass through an attacked square.
 */
export const standardCastling: CastlingRule = {
  rights: unmovedRooks,
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
