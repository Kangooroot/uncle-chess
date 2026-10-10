import { describe, expect, it } from "vitest";
import { createChessMode, type ChessState } from "../../chess";
import { tourcoing, tourcoingRules } from ".";

/** A Tourcoing game from another start placement (white to move unless `turn`). */
function position(placement: string, turn: "w" | "b" = "w") {
  return createChessMode(
    { id: "test", name: "", description: "" },
    { ...tourcoingRules, setup: { ...tourcoingRules.setup, placement, turn } },
  ).setup();
}

/** Plays moves written as "c3d3", each by the side to move. `null` if one is illegal. */
function play(moves: string, state: ChessState = tourcoing.setup()): ChessState | null {
  for (const m of moves.split(" ")) {
    const next = tourcoing.play(state, { from: m.slice(0, 2), to: m.slice(2, 4) }, state.turn);
    if (!next) return null;
    state = next;
  }
  return state;
}

const pieces = (state: ChessState) => tourcoing.view(state, "spectator").pieces;
const moves = (state: ChessState, square: string) => new Set(tourcoing.view(state, "spectator").moves[square]);

describe("tourcoing", () => {
  it("starts with the armies in opposite corners", () => {
    const state = tourcoing.setup();
    const view = pieces(state);
    expect(Object.keys(view)).toHaveLength(30);
    expect(view.a1).toEqual({ color: "w", kind: "k" });
    expect(view.h8).toEqual({ color: "b", kind: "k" });
    expect(view.b2).toEqual({ color: "w", kind: "q" });
    expect(view.g7).toEqual({ color: "b", kind: "q" });
    for (const sq of ["a2", "b1", "e8", "h5"]) expect(view[sq]?.kind).toBe("b"); // all on light squares
    for (const sq of ["a5", "b4", "c4", "c3", "d3", "d2", "e1"])
      expect(view[sq]).toEqual({ color: "w", kind: "p", dir: "e" });
    for (const sq of ["d8", "e7", "e6", "f6", "f5", "g5", "h4"])
      expect(view[sq]).toEqual({ color: "b", kind: "p", dir: "s" });
    expect(tourcoing.toPlay(state)).toBe("w");
    expect(tourcoing.status(state)).toEqual({ kind: "playing" });
  });

  it("moves white pawns east and black pawns south", () => {
    const state = tourcoing.setup();
    expect(moves(state, "a5")).toEqual(new Set(["b5", "c5"]));
    expect(moves(state, "c3")).toEqual(new Set()); // d3 is taken
    expect(moves(play("a5b5")!, "h4")).toEqual(new Set(["h3", "h2"]));
  });

  it("captures diagonally forward, in the pawn's direction", () => {
    const state = position("7k/8/8/3p4/2P5/3p4/8/K7");
    expect(moves(state, "c4")).toEqual(new Set(["d4", "e4", "d5", "d3"]));
  });

  describe("castling", () => {
    it("swaps the king and a rook of its file or rank", () => {
      const state = play("b3d4 h4h3 a2b3 e6e5 a1a3")!;
      expect(pieces(state).a3).toEqual({ color: "w", kind: "k" });
      expect(pieces(state).a1).toEqual({ color: "w", kind: "r" });

      const rank = play("e8e7 a1d1", position("4p2k/8/8/8/8/8/8/K2R4", "b"))!;
      expect(pieces(rank).d1).toEqual({ color: "w", kind: "k" });
      expect(pieces(rank).a1).toEqual({ color: "w", kind: "r" });
    });

    it("needs empty squares between them", () => {
      expect(moves(tourcoing.setup(), "a1")).toEqual(new Set());
    });

    it("is refused in check, through an attacked square, or onto one", () => {
      expect(moves(position("7k/8/8/8/8/R7/8/K6r"), "a1")).toEqual(new Set(["a2", "b2"])); // in check
      expect(moves(position("7k/8/8/8/8/R7/7r/K7"), "a1")).toEqual(new Set(["b1"])); // a2 attacked
      expect(moves(position("7k/8/8/8/8/R6r/8/K7"), "a1")).toEqual(new Set(["a2", "b1", "b2"])); // a3 attacked
      expect(moves(position("7k/8/8/8/8/R7/8/K7"), "a1")).toEqual(new Set(["a2", "b1", "b2", "a3"]));
    });

    it("is lost once the rook has moved", () => {
      const state = play("a3a4 h8g8 a4a3 g8h8", position("7k/8/8/8/8/R7/8/K7"))!;
      expect(moves(state, "a1")).not.toContain("a3");
    });
  });

  describe("rare pawns", () => {
    it("are promoted pawns turned 90°, that can move two squares and be taken en passant", () => {
      const promoted = play("g3h3", position("7k/8/8/6p1/8/6P1/8/K7"))!;
      expect(pieces(promoted).h3).toEqual({ color: "w", kind: "rare-pawn", dir: "n" });

      const state = play("h8g8 h3h5", promoted)!;
      expect(state.enPassant).toEqual({ target: "h4", pawn: "h5" });
      const taken = play("g5h4", state)!;
      expect(pieces(taken).h5).toBeUndefined();
      expect(pieces(taken).h4).toEqual({ color: "b", kind: "p", dir: "s" });
    });

    it("capture diagonally forward in their new direction", () => {
      const state = play("g3h3 h8g8", position("7k/8/8/8/6p1/6P1/8/K7"))!;
      expect(moves(state, "h3")).toEqual(new Set(["h4", "h5", "g4"]));
    });

    it("win when they reach their goal", () => {
      const white = play("g6h6 a5a4 h6h8", position("6k1/8/6P1/p7/8/8/8/K7"))!;
      expect(tourcoing.status(white)).toEqual({ kind: "win", winner: "w", reason: "rare-pawn" });
      expect(tourcoing.toPlay(white)).toBeNull();

      const black = play("b2b1 h1h2 b1a1", position("7k/8/8/8/8/8/1p6/7K", "b"))!;
      expect(pieces(black).a1).toEqual({ color: "b", kind: "rare-pawn", dir: "w" });
      expect(tourcoing.status(black)).toEqual({ kind: "win", winner: "b", reason: "rare-pawn" });
    });

    it("win at once when promoted on a corner of their goal", () => {
      const white = play("g8h8", position("k5P1/8/8/8/8/8/8/7K"))!;
      expect(tourcoing.status(white)).toEqual({ kind: "win", winner: "w", reason: "rare-pawn" });
      const black = play("a2a1", position("7k/8/8/8/8/8/p7/7K", "b"))!;
      expect(tourcoing.status(black)).toEqual({ kind: "win", winner: "b", reason: "rare-pawn" });
    });
  });

  it("makes the player producing a threefold repetition lose", () => {
    const shuffle = "c2e3 f7d6 e3c2 d6f7";
    expect(tourcoing.status(play(`${shuffle} c2e3 f7d6 e3c2`)!)).toEqual({ kind: "playing" });
    expect(tourcoing.status(play(`${shuffle} ${shuffle}`)!)).toEqual({
      kind: "win",
      winner: "w",
      reason: "repetition",
    });
  });

  it("plays random games to the end, accepting every move it lists", () => {
    let seed = 7;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const endings = new Set<string>();
    for (let game = 0; game < 30; game++) {
      let state = tourcoing.setup();
      for (let ply = 0; ply < 300 && tourcoing.toPlay(state); ply++) {
        const options = Object.entries(tourcoing.view(state, "spectator").moves).flatMap(([from, tos]) =>
          tos!.map((to) => ({ from, to })),
        );
        state = tourcoing.play(state, options[Math.floor(rand() * options.length)], state.turn)!;
        expect(state).not.toBeNull();
      }
      const status = tourcoing.status(state);
      if (status.kind !== "playing") endings.add(status.reason);
    }
    expect(endings.size).toBeGreaterThan(0);
  }, 60_000);
});
