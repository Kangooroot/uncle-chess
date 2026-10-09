// Classic chess rules, the base every close mode overrides: `{ ...classicRules, ... }`.

import { standardCastling } from "./castling";
import { checkmate, fiftyMoves, insufficientMaterial, repetition, stalemate } from "./endings";
import { ALL_DIRS, DIAGONAL, ORTHOGONAL, king, knight, pawn, slider } from "./pieces";
import { promoteTo } from "./promotion";
import type { ChessRules } from "./types";

export const classicRules: ChessRules = {
  setup: { placement: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR", pawnDirs: { w: "n", b: "s" }, turn: "w" },
  pieces: { k: king, q: slider(ALL_DIRS), r: slider(ORTHOGONAL), b: slider(DIAGONAL), n: knight, p: pawn },
  castling: standardCastling,
  promotion: promoteTo(["q", "r", "b", "n"]),
  endings: [checkmate, stalemate, repetition("draw"), fiftyMoves, insufficientMaterial],
};
