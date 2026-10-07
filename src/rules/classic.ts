// Classic chess, based on chess.js. Serves as the base for close game modes.

import { Chess } from "chess.js";
import type { Move, Position, Status, Variant } from "./index";

function replay(moves: Move[]): Chess {
  const chess = new Chess();
  for (const move of moves) chess.move(move);
  return chess;
}

function status(chess: Chess): Status {
  if (chess.isCheckmate()) return { kind: "checkmate", winner: chess.turn() === "w" ? "b" : "w" };
  if (chess.isStalemate()) return { kind: "draw", reason: "stalemate" };
  if (chess.isThreefoldRepetition()) return { kind: "draw", reason: "repetition" };
  if (chess.isDrawByFiftyMoves()) return { kind: "draw", reason: "fifty-moves" };
  if (chess.isInsufficientMaterial()) return { kind: "draw", reason: "material" };
  return { kind: "playing" };
}

function toPosition(chess: Chess): Position {
  return { fen: chess.fen(), turn: chess.turn(), inCheck: chess.isCheck(), status: status(chess) };
}

export const classic: Variant = {
  id: "classic",
  name: "Classic chess",

  position(moves) {
    return toPosition(replay(moves));
  },

  play(moves, move) {
    const chess = replay(moves);
    if (chess.isGameOver()) return null;
    try {
      chess.move(move);
    } catch {
      return null;
    }
    return toPosition(chess);
  },
};
