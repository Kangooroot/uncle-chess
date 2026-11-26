// French chess: four games of chess at once on interleaved boards of
// hexagons, pieces jumping from one board to another. Rules in
// specs/modes/french.md.

import type { Color, GameMode, ViewPiece } from "../../core";
import { STANDARD_REASONS } from "../../chess";
import { BOARDS, cellOf, toCell, type BoardId, type Cell } from "./board";
import {
  checkedRoyals,
  findMove,
  legalMoves,
  makeMove,
  settle,
  setup,
  type FrenchAction,
  type FrenchState,
} from "./rules";

export * from "./board";
export * from "./rules";

/** What the UI draws: the hexagonal board, with classic and hexagonal move hints kept apart. */
export type FrenchView = {
  pieces: Partial<Record<Cell, ViewPiece>>;
  turn: Color | null;
  lastMove: { from: Cell; to: Cell } | null;
  check: Cell[]; // royal pieces in check
  moves: Partial<Record<Cell, Cell[]>>; // classic destinations of each piece of the side to move
  hexMoves: Partial<Record<Cell, Cell[]>>; // hexagonal destinations
  forbidden: BoardId[]; // mated boards
  score: Record<Color, number>; // mates
};

const toPlay = (state: FrenchState) => (state.status.kind === "playing" ? state.turn : null);

export const french: GameMode<FrenchState, FrenchAction, FrenchView> = {
  id: "french",
  name: "Échecs Français",
  description:
    "Quatre parties d'échecs à la fois sur un plateau d'hexagones. Les pièces passent d'un échiquier à l'autre ; le premier qui mate deux fois gagne.",
  reasons: {
    ...STANDARD_REASONS,
    mates: "Deux mats",
    "stalemate-lead": "Pat, victoire aux points",
    "material-lead": "Matériel insuffisant, victoire aux points",
  },
  setup,
  play(state, action, player) {
    if (toPlay(state) !== player) return null;
    const move = findMove(state, action);
    return move && settle(makeMove(state, move));
  },
  toPlay,
  status: (state) => state.status,
  view(state) {
    const pieces: FrenchView["pieces"] = {};
    state.boards.forEach((board, b) =>
      board.forEach((piece, sq) => {
        if (piece)
          pieces[toCell(cellOf(b, sq))] = {
            color: piece.color,
            kind: piece.type,
            ...(piece.dir && { dir: piece.dir }),
          };
      }),
    );
    const moves: FrenchView["moves"] = {};
    const hexMoves: FrenchView["hexMoves"] = {};
    if (toPlay(state)) {
      for (const move of legalMoves(state)) {
        const targets = ((move.hex ? hexMoves : moves)[toCell(move.from)] ??= []);
        // Promotions give several moves to the same cell.
        if (!targets.includes(toCell(move.to))) targets.push(toCell(move.to));
      }
    }
    return {
      pieces,
      turn: toPlay(state),
      lastMove: state.lastMove,
      check: checkedRoyals(state.boards, state.turn).map(toCell),
      moves,
      hexMoves,
      forbidden: BOARDS.filter((_, b) => state.forbidden[b]),
      score: state.score,
    };
  },
};
