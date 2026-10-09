// The chess engine with classicRules, checked against chess.js, plus the
// building blocks classic chess does not exercise.

import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { toIndex, toSquare, type Status } from "../core";
import {
  checkmate,
  classicRules,
  createChessMode,
  fiftyMoves,
  insufficientMaterial,
  legalMoves,
  makeMove,
  parsePlacement,
  repetition,
  settle,
  stalemate,
  type ChessAction,
  type ChessMove,
  type ChessRules,
  type ChessState,
} from ".";

const classic = createChessMode({ id: "classic", name: "", description: "" }, classicRules);

/** Our state for a FEN. `moved` comes from the castling rights and the pawns' start ranks. */
function fromFen(fen: string): ChessState {
  const [placement, turn, castling, ep, halfmoves] = fen.split(" ");
  const board = parsePlacement({ placement, pawnDirs: { w: "n", b: "s" } });
  const unmoved = new Set<string>();
  if (castling.includes("K")) unmoved.add("e1").add("h1");
  if (castling.includes("Q")) unmoved.add("e1").add("a1");
  if (castling.includes("k")) unmoved.add("e8").add("h8");
  if (castling.includes("q")) unmoved.add("e8").add("a8");
  board.forEach((piece, sq) => {
    if (!piece) return;
    const startRank = piece.color === "w" ? "2" : "7";
    piece.moved = piece.type === "p" ? toSquare(sq)[1] !== startRank : !unmoved.has(toSquare(sq));
  });
  const enPassant = ep === "-" ? null : { target: ep, pawn: toSquare(toIndex(ep) + (turn === "w" ? -8 : 8)) };
  return settle(classicRules, {
    board,
    turn: turn as "w" | "b",
    enPassant,
    halfmoves: Number(halfmoves),
    history: [],
    lastMove: null,
    status: { kind: "playing" },
  });
}

function perft(rules: ChessRules, state: ChessState, depth: number): number {
  const moves = legalMoves(rules, state);
  if (depth === 1) return moves.length;
  return moves.reduce((sum, move) => sum + perft(rules, makeMove(state, move), depth - 1), 0);
}

const lan = (move: ChessMove) => toSquare(move.from) + toSquare(move.to) + (move.promotion?.type ?? "");

function chessJsStatus(chess: Chess): Status {
  if (chess.isCheckmate()) return { kind: "win", winner: chess.turn() === "w" ? "b" : "w", reason: "checkmate" };
  if (chess.isStalemate()) return { kind: "draw", reason: "stalemate" };
  if (chess.isThreefoldRepetition()) return { kind: "draw", reason: "repetition" };
  if (chess.isDrawByFiftyMoves()) return { kind: "draw", reason: "fifty-moves" };
  if (chess.isInsufficientMaterial()) return { kind: "draw", reason: "material" };
  return { kind: "playing" };
}

/** Deterministic pseudo-random numbers (mulberry32), so failures can be replayed. */
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function playAll(mode: typeof classic, actions: ChessAction[]): ChessState {
  return actions.reduce((state, action) => mode.play(state, action, state.turn)!, mode.setup());
}

describe("classic rules against chess.js", () => {
  // Start position, then the standard tricky positions (castling, en passant, promotion, pins).
  it.each([
    ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", 3],
    ["r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1", 3],
    ["8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1", 4],
    ["r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1", 3],
    ["rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8", 3],
    ["r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10", 3],
  ])("perft of %s at depth %i", (fen, depth) => {
    expect(perft(classicRules, fromFen(fen), depth)).toBe(new Chess(fen).perft(depth));
  });

  it("has the same legal moves and status in random games", () => {
    const rand = random(42);
    for (let game = 0; game < 20; game++) {
      const chess = new Chess();
      let state = classic.setup();
      for (let ply = 0; ply < 400 && !chess.isGameOver(); ply++) {
        const expected = chess.moves({ verbose: true });
        const moves = legalMoves(classicRules, state).map(lan);
        expect(moves).toHaveLength(expected.length);
        expect(new Set(moves)).toEqual(new Set(expected.map((m) => m.lan)));

        const { from, to, promotion } = expected[Math.floor(rand() * expected.length)];
        chess.move({ from, to, promotion });
        const next = classic.play(state, { from, to, promotion }, state.turn);
        expect(next).not.toBeNull();
        state = next!;
        expect(state.status).toEqual(chessJsStatus(chess));
      }
    }
  }, 60_000);
});

describe("play", () => {
  it("rejects malformed actions", () => {
    const state = classic.setup();
    for (const action of [
      null,
      42,
      "e2e4",
      {},
      { from: "e2" },
      { from: "e2", to: "e9" },
      { from: "e2", to: "e4", promotion: 1 },
    ]) {
      expect(classic.play(state, action as ChessAction, "w")).toBeNull();
    }
    expect(classic.play(state, { from: "e2", to: "e4", promotion: "q" }, "w")).toBeNull();
    expect(classic.play(state, { from: "e2", to: "e4" }, "b")).toBeNull();
  });
});

describe("building blocks", () => {
  // Knight shuffle: the start position comes back a third time after black's 8th half-move.
  const shuffle: ChessAction[] = ["g1f3", "g8f6", "f3g1", "f6g8", "g1f3", "g8f6", "f3g1", "f6g8"].map((m) => ({
    from: m.slice(0, 2),
    to: m.slice(2),
  }));

  it("repetition('draw') draws on the third occurrence", () => {
    expect(playAll(classic, shuffle.slice(0, 7)).status).toEqual({ kind: "playing" });
    expect(playAll(classic, shuffle).status).toEqual({ kind: "draw", reason: "repetition" });
  });

  it("repetition('loses'): the player producing the third occurrence loses", () => {
    const rules = {
      ...classicRules,
      endings: [checkmate, stalemate, repetition("loses"), fiftyMoves, insufficientMaterial],
    };
    const mode = createChessMode({ id: "test", name: "", description: "" }, rules);
    expect(playAll(mode, shuffle).status).toEqual({ kind: "win", winner: "w", reason: "repetition" });
  });

  describe("perpendicular pawns", () => {
    // White pawns move east, black pawns south.
    const rules: ChessRules = {
      ...classicRules,
      setup: { placement: "7k/8/8/8/2p5/2P5/8/K7", pawnDirs: { w: "e", b: "s" }, turn: "w" },
    };
    const mode = createChessMode({ id: "test", name: "", description: "" }, rules);

    it("move and capture along their own direction", () => {
      const moves = legalMoves(rules, mode.setup()).map(lan);
      expect(moves).toContain("c3d3");
      expect(moves).toContain("c3e3");
      expect(moves).not.toContain("c3c4");

      const blocked = settle(rules, { ...mode.setup(), turn: "b" });
      expect(
        legalMoves(rules, blocked)
          .map(lan)
          .filter((m) => m.startsWith("c4")),
      ).toEqual([]);
    });

    it("take en passant across directions", () => {
      const state = mode.play(mode.setup(), { from: "c3", to: "e3" }, "w")!;
      expect(state.enPassant).toEqual({ target: "d3", pawn: "e3" });
      const after = mode.play(state, { from: "c4", to: "d3" }, "b")!;
      const view = mode.view(after, "spectator");
      expect(view.pieces).toEqual({
        h8: { color: "b", kind: "k" },
        a1: { color: "w", kind: "k" },
        d3: { color: "b", kind: "p", dir: "s" },
      });
    });
  });
});
