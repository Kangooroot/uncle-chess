// Ending building blocks, checked in order after each move.

import { fileOf, opponent, rankOf } from "../core";
import type { EndingRule } from "./types";

export const checkmate: EndingRule = (state, { legalMoves, inCheck }) =>
  legalMoves.length === 0 && inCheck ? { kind: "win", winner: opponent(state.turn), reason: "checkmate" } : null;

export const stalemate: EndingRule = (_state, { legalMoves }) =>
  legalMoves.length === 0 ? { kind: "draw", reason: "stalemate" } : null;

/**
 * Third occurrence of the same position. `"draw"`: classic rule. `"loses"`:
 * the player whose move produced it loses.
 */
export function repetition(outcome: "draw" | "loses"): EndingRule {
  return (state) => {
    const current = state.history[state.history.length - 1];
    if (state.history.filter((key) => key === current).length < 3) return null;
    return outcome === "draw"
      ? { kind: "draw", reason: "repetition" }
      : { kind: "win", winner: state.turn, reason: "repetition" };
  };
}

export const fiftyMoves: EndingRule = (state) =>
  state.halfmoves >= 100 ? { kind: "draw", reason: "fifty-moves" } : null;

/**
 * No mate possible: kings alone, a single knight or bishop, or only bishops
 * all on squares of the same colour.
 */
export const insufficientMaterial: EndingRule = (state) => {
  const others = state.board.flatMap((piece, sq) => (piece && piece.type !== "k" ? [{ type: piece.type, sq }] : []));
  const bishopColors = new Set(others.filter((p) => p.type === "b").map((p) => (fileOf(p.sq) + rankOf(p.sq)) % 2));
  const insufficient =
    others.length === 0 ||
    (others.length === 1 && (others[0].type === "n" || others[0].type === "b")) ||
    (others.every((p) => p.type === "b") && bishopColors.size === 1);
  return insufficient ? { kind: "draw", reason: "material" } : null;
};
