// Builds a whole `GameMode` from a `ChessRules`.

import { toSquare, type BoardView, type GameMode } from "../core";
import { checkedRoyals, findMove, makeMove, settle, setup } from "./engine";
import type { ChessAction, ChessRules, ChessState } from "./types";

/** Display text (UI, in French) of the reasons used by the standard ending rules. A mode adds its own with spread. */
export const STANDARD_REASONS: Record<string, string> = {
  checkmate: "Échec et mat",
  stalemate: "Pat",
  repetition: "Triple répétition",
  "fifty-moves": "Règle des cinquante coups",
  material: "Matériel insuffisant",
};

const toPlay = (state: ChessState) => (state.status.kind === "playing" ? state.turn : null);

export function createChessMode(
  meta: { id: string; name: string; description: string },
  rules: ChessRules,
): GameMode<ChessState, ChessAction> {
  return {
    ...meta,
    reasons: STANDARD_REASONS,
    setup: () => setup(rules),
    play(state, action, player) {
      if (toPlay(state) !== player) return null;
      const move = findMove(rules, state, action);
      return move && settle(rules, makeMove(state, move));
    },
    toPlay,
    status: (state) => state.status,
    view(state) {
      const pieces: BoardView["pieces"] = {};
      state.board.forEach((piece, sq) => {
        if (piece)
          pieces[toSquare(sq)] = { color: piece.color, kind: piece.type, ...(piece.dir && { dir: piece.dir }) };
      });
      return {
        pieces,
        turn: toPlay(state),
        lastMove: state.lastMove,
        check: checkedRoyals(rules, state.board, state.turn).map(toSquare),
      };
    },
  };
}
