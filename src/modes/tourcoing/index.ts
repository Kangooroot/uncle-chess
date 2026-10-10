// Tourcoing chess: armies in opposite corners, pawns moving sideways, rare
// pawns. Rules in specs/modes/tourcoing.md.

import { step, type Color, type Dir } from "../../core";
import {
  checkmate,
  classicRules,
  createChessMode,
  fiftyMoves,
  insufficientMaterial,
  pawn,
  repetition,
  STANDARD_REASONS,
  stalemate,
  swapCastling,
  type ChessRules,
  type EndingRule,
} from "../../chess";

/** A pawn that turned 90° on its promotion line. */
export const RARE_PAWN = "rare-pawn";

/** Direction of each side's rare pawns: their goal is the board edge that way. */
const RARE_PAWN_DIRS: Record<Color, Dir> = { w: "n", b: "w" };

/** A rare pawn standing on its goal wins, also when it is promoted there (white h8, black a1). */
const rarePawnGoal: EndingRule = (state) => {
  for (const [sq, piece] of state.board.entries()) {
    if (piece?.type === RARE_PAWN && step(sq, piece.dir!) === null) {
      return { kind: "win", winner: piece.color, reason: "rare-pawn" };
    }
  }
  return null;
};

export const tourcoingRules: ChessRules = {
  setup: { placement: "3pbr1k/4pnq1/4ppnr/P4ppb/1PP4p/RNPP4/BQNP4/KBR1P3", pawnDirs: { w: "e", b: "s" }, turn: "w" },
  pieces: { ...classicRules.pieces, [RARE_PAWN]: pawn },
  castling: swapCastling,
  promotion: {
    // A pawn reaching the board edge in its direction always turns into a rare
    // pawn, unmoved: it can move two squares again.
    options(piece, to) {
      if (piece.type !== "p" || !piece.dir || step(to, piece.dir) !== null) return null;
      return [{ type: RARE_PAWN, color: piece.color, moved: false, dir: RARE_PAWN_DIRS[piece.color] }];
    },
  },
  // The rare pawn goal comes first: reaching it wins even if it also stalemates.
  endings: [rarePawnGoal, checkmate, stalemate, repetition("loses"), fiftyMoves, insufficientMaterial],
};

const mode = createChessMode(
  {
    id: "tourcoing",
    name: "Échecs de Tourcoing",
    description:
      "Les armées partent de coins opposés, les pions avancent de côté. Un pion promu devient un pion rare, qui tourne et gagne la partie s'il atteint le bord.",
  },
  tourcoingRules,
);

export const tourcoing = { ...mode, reasons: { ...STANDARD_REASONS, "rare-pawn": "Pion rare arrivé au bord" } };
