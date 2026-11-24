// French chess rules: four classic games on interleaved boards, with
// hexagonal moves between them. Rules in specs/modes/french.md.
//
// Classic moves reuse the chess family's building blocks, one board at a
// time; legality, mates and endings are global and live here.

import { opponent, toSquare, type Color, type Status } from "../../core";
import {
  classicRules,
  parsePlacement,
  standardCastling,
  type Board,
  type ChessMove,
  type ChessState,
  type Piece,
} from "../../chess";
import { BOARDS, boardOf, cellOf, HEX_DIRS, hexLine, isCell, squareOf, toCell, toCellIndex, type Cell } from "./board";

export type FrenchState = {
  boards: Board[]; // red, blue, green, yellow
  forbidden: boolean[]; // mated boards: empty, can be crossed but not stopped on
  score: Record<Color, number>; // mates
  turn: Color;
  enPassant: { target: Cell; pawn: Cell } | null; // skipped cell, and the pawn to capture
  history: string[]; // position keys since the last irreversible move, current one included (repetition)
  lastMove: { from: Cell; to: Cell } | null;
  status: Status;
};

export type FrenchAction = { from: Cell; to: Cell; promotion?: string };

/** Internal form of a move. Cells are indices 0…255. */
export type FrenchMove = {
  from: number;
  to: number;
  hex: boolean; // hexagonal move (never captures)
  capture?: number;
  rook?: { from: number; to: number }; // castling, on the king's board
  enPassant?: { target: number; pawn: number };
  promotion?: Piece;
};

/** Hexagonal range of each piece type. Kings and pawns have none. */
export const HEX_RANGE: Record<string, number> = { n: 3, b: 3, r: 5, q: 9 };

/** Mates needed to win. */
const MATES_TO_WIN = 2;

const pieces = classicRules.pieces;

const pieceAt = (state: FrenchState, cell: number) => state.boards[boardOf(cell)][squareOf(cell)];

/** A classic chess state for one board, to call the chess building blocks. */
function boardState(state: FrenchState, board: number): ChessState {
  const ep = state.enPassant && {
    target: toCellIndex(state.enPassant.target),
    pawn: toCellIndex(state.enPassant.pawn),
  };
  return {
    board: state.boards[board],
    turn: state.turn,
    enPassant:
      ep && boardOf(ep.target) === board
        ? { target: toSquare(squareOf(ep.target)), pawn: toSquare(squareOf(ep.pawn)) }
        : null,
    halfmoves: 0,
    history: [],
    lastMove: null,
    status: { kind: "playing" },
  };
}

function attackedOn(board: Board, square: number, by: Color): boolean {
  return board.some((piece, sq) => piece?.color === by && pieces[piece.type].attacks(board, sq).includes(square));
}

/** Cells of the royal pieces of `color` that are attacked. A piece only attacks on its own board. */
export function checkedRoyals(boards: Board[], color: Color): number[] {
  return boards.flatMap((board, b) =>
    board.flatMap((piece, sq) =>
      piece?.color === color && pieces[piece.type].royal && attackedOn(board, sq, opponent(color))
        ? [cellOf(b, sq)]
        : [],
    ),
  );
}

/** Boards where a royal piece of `color` is attacked (indices into `boards`). */
export function checkedBoards(boards: Board[], color: Color): number[] {
  return [...new Set(checkedRoyals(boards, color).map(boardOf))];
}

const fromChessMove = (board: number, move: ChessMove): FrenchMove => ({
  from: cellOf(board, move.from),
  to: cellOf(board, move.to),
  hex: false,
  ...(move.capture !== undefined && { capture: cellOf(board, move.capture) }),
  ...(move.rook && { rook: { from: cellOf(board, move.rook.from), to: cellOf(board, move.rook.to) } }),
  ...(move.enPassant && {
    enPassant: { target: cellOf(board, move.enPassant.target), pawn: cellOf(board, move.enPassant.pawn) },
  }),
});

/** Classic moves of the side to move on one board, promotions and castling included. Pseudo-legal. */
function classicMoves(state: FrenchState, board: number): FrenchMove[] {
  const sub = boardState(state, board);
  const moves: FrenchMove[] = [];
  sub.board.forEach((piece, sq) => {
    if (piece?.color !== state.turn) return;
    const kind = pieces[piece.type];
    for (const move of kind.moves(sub, sq)) {
      const options = classicRules.promotion.options(piece, move.to);
      const base = fromChessMove(board, move);
      if (options) moves.push(...options.map((promotion) => ({ ...base, promotion })));
      else moves.push(base);
    }
    if (kind.royal) {
      const castling = standardCastling.moves(sub, sq, (square, by) => attackedOn(sub.board, square, by));
      moves.push(...castling.map((move) => fromChessMove(board, move)));
    }
  });
  return moves;
}

/**
 * Hexagonal moves of the side to move: knights, bishops, rooks and queens
 * slide in a straight line over empty hexagons, never from their side's first
 * rank, and never stop on a forbidden board (but may cross it).
 */
function hexMoves(state: FrenchState): FrenchMove[] {
  const firstRank = state.turn === "w" ? 0 : 7;
  const moves: FrenchMove[] = [];
  state.boards.forEach((board, b) => {
    board.forEach((piece, sq) => {
      const range = piece?.color === state.turn ? HEX_RANGE[piece.type] : undefined;
      if (!range || sq >> 3 === firstRank) return;
      const from = cellOf(b, sq);
      for (const dir of HEX_DIRS) {
        for (const to of hexLine(from, dir, range)) {
          if (pieceAt(state, to)) break;
          if (!state.forbidden[boardOf(to)]) moves.push({ from, to, hex: true });
        }
      }
    });
  });
  return moves;
}

function applyToBoards(boards: Board[], move: FrenchMove): Board[] {
  const next = boards.map((board) => board.slice());
  const at = (cell: number) => next[boardOf(cell)][squareOf(cell)];
  const set = (cell: number, piece: Piece | null) => (next[boardOf(cell)][squareOf(cell)] = piece);
  const piece = at(move.from)!;
  const rook = move.rook && at(move.rook.from);
  if (move.capture !== undefined) set(move.capture, null);
  set(move.from, null);
  if (move.rook) set(move.rook.from, null);
  set(move.to, move.promotion ?? { ...piece, moved: true });
  if (move.rook && rook) set(move.rook.to, { ...rook, moved: true });
  return next;
}

/**
 * Legal moves of the side to move: no royal piece of that side left attacked,
 * and no check given on two boards at once.
 */
export function legalMoves(state: FrenchState): FrenchMove[] {
  const { boards, turn } = state;
  const live = boards.flatMap((_, b) => (state.forbidden[b] ? [] : [b]));
  const candidates = [...live.flatMap((b) => classicMoves(state, b)), ...hexMoves(state)];
  const inCheck = checkedBoards(boards, turn);
  return candidates.filter((move) => {
    const next = applyToBoards(boards, move);
    // Only the boards the move touches can change; the others keep their checks.
    const touched = [...new Set([boardOf(move.from), boardOf(move.to), ...inCheck])];
    const sub = touched.map((b) => next[b]);
    if (checkedBoards(sub, turn).length > 0) return false;
    return checkedBoards(sub, opponent(turn)).length <= 1;
  });
}

/**
 * Identifies a position for repetition: the pieces, the forbidden boards, the
 * side to move, the castling rights, and the en passant target only when it
 * can be taken. `moved` is left out, except through castling rights.
 */
function positionKey(state: FrenchState, moves: FrenchMove[]): string {
  const cells = state.boards.map((board) =>
    board.map((piece) => (piece ? `${piece.color}${piece.type}${piece.dir ?? ""}` : "")).join("/"),
  );
  const rights = state.boards.flatMap((board, b) =>
    board.flatMap((piece, sq) =>
      piece && pieces[piece.type].royal ? standardCastling.rights(board, sq).map((rook) => cellOf(b, rook)) : [],
    ),
  );
  const enPassant = moves.some((move) => move.capture !== undefined && move.capture !== move.to);
  const forbidden = state.forbidden.map((f) => (f ? 1 : 0)).join("");
  return `${cells.join("|")} ${forbidden} ${state.turn} ${rights.join(",")} ${enPassant ? state.enPassant?.target : "-"}`;
}

/**
 * Only kings left, or kings and a single knight or bishop against kings
 * alone, over all live boards: nobody can mate any more.
 */
function insufficientMaterial(boards: Board[]): boolean {
  const others = boards.flatMap((board) => board.filter((piece) => piece && piece.type !== "k")) as Piece[];
  return others.length === 0 || (others.length === 1 && (others[0].type === "n" || others[0].type === "b"));
}

/** A draw ending, unless a player leads on mates: that player wins. */
function drawOrLead(score: Record<Color, number>, reason: string): Status {
  if (score.w === score.b) return { kind: "draw", reason };
  return { kind: "win", winner: score.w > score.b ? "w" : "b", reason: `${reason}-lead` };
}

/**
 * After a move: resolves a mate (the board is emptied and becomes forbidden,
 * the mating player scores), records the position and computes `status`.
 */
export function settle(state: FrenchState): FrenchState {
  let moves = legalMoves(state);
  const mated = checkedBoards(state.boards, state.turn);
  if (moves.length === 0 && mated.length > 0) {
    const winner = opponent(state.turn);
    const boards = state.boards.map((board, b) => (mated.includes(b) ? board.map(() => null) : board));
    const forbidden = state.forbidden.map((f, b) => f || mated.includes(b));
    const score = { ...state.score, [winner]: state.score[winner] + 1 };
    const enPassant =
      state.enPassant && mated.includes(boardOf(toCellIndex(state.enPassant.target))) ? null : state.enPassant;
    // A mate can't be undone: no earlier position can come back.
    state = { ...state, boards, forbidden, score, enPassant, history: [] };
    if (score[winner] >= MATES_TO_WIN) {
      return { ...state, status: { kind: "win", winner, reason: "mates" } };
    }
    moves = legalMoves(state);
  }

  const settled = { ...state, history: [...state.history, positionKey(state, moves)] };
  const current = settled.history[settled.history.length - 1];
  if (settled.history.filter((key) => key === current).length >= 3) {
    // The player whose move produced the third occurrence loses.
    return { ...settled, status: { kind: "win", winner: state.turn, reason: "repetition" } };
  }
  if (moves.length === 0) return { ...settled, status: drawOrLead(state.score, "stalemate") };
  if (insufficientMaterial(state.boards)) return { ...settled, status: drawOrLead(state.score, "material") };
  return { ...settled, status: { kind: "playing" } };
}

/** Plays a move, without updating `history` and `status` (see `settle`). */
export function makeMove(state: FrenchState, move: FrenchMove): FrenchState {
  const piece = pieceAt(state, move.from)!;
  // Captures and pawn moves can't be undone: no earlier position can come back.
  const irreversible = move.capture !== undefined || piece.dir !== undefined;
  return {
    ...state,
    boards: applyToBoards(state.boards, move),
    turn: opponent(state.turn),
    enPassant: move.enPassant ? { target: toCell(move.enPassant.target), pawn: toCell(move.enPassant.pawn) } : null,
    history: irreversible ? [] : state.history,
    lastMove: { from: toCell(move.from), to: toCell(move.to) },
  };
}

/**
 * A position from one FEN-like placement per board (red, blue, green,
 * yellow); `null` for a forbidden board. Used by the setup and by tests.
 */
export function fromPlacements(
  placements: (string | null)[],
  { turn = "w", score = { w: 0, b: 0 } }: { turn?: Color; score?: Record<Color, number> } = {},
): FrenchState {
  return settle({
    boards: placements.map((placement) =>
      placement === null ? Array(64).fill(null) : parsePlacement({ placement, pawnDirs: classicRules.setup.pawnDirs }),
    ),
    forbidden: placements.map((placement) => placement === null),
    score,
    turn,
    enPassant: null,
    history: [],
    lastMove: null,
    status: { kind: "playing" },
  });
}

/** The classic start position on every board, white to move. */
export const setup = () => fromPlacements(BOARDS.map(() => classicRules.setup.placement));

/** The legal move matching an untrusted action, or `null`. No `promotion`: the default option. */
export function findMove(state: FrenchState, action: unknown): FrenchMove | null {
  if (typeof action !== "object" || action === null) return null;
  const { from, to, promotion } = action as Record<string, unknown>;
  if (!isCell(from) || !isCell(to)) return null;
  if (promotion !== undefined && typeof promotion !== "string") return null;
  const candidates = legalMoves(state).filter((m) => m.from === toCellIndex(from) && m.to === toCellIndex(to));
  // A destination reachable both ways gives the same position: prefer the classic move.
  candidates.sort((a, b) => Number(a.hex) - Number(b.hex));
  if (promotion === undefined) return candidates[0] ?? null;
  return candidates.find((m) => m.promotion?.type === promotion) ?? null;
}
