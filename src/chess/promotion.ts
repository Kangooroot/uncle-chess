// Promotion building blocks.

import { step } from "../core";
import type { PromotionRule } from "./types";

/** A pawn ("p") reaching the board edge in its direction turns into one of `types`, the first being the default. */
export function promoteTo(types: string[]): PromotionRule {
  return {
    options(piece, to) {
      if (piece.type !== "p" || !piece.dir || step(to, piece.dir) !== null) return null;
      return types.map((type) => ({ type, color: piece.color, moved: true }));
    },
  };
}
