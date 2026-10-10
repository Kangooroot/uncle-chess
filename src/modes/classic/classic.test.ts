import { describe, expect, it } from "vitest";
import type { ChessAction, ChessState } from "../../chess";
import { classic } from ".";

/** Plays moves written as "e2e4" (or "g7h8q"), each by the side to move. */
function play(moves: string, state: ChessState = classic.setup()): ChessState | null {
  for (const m of moves.split(" ")) {
    const action: ChessAction = { from: m.slice(0, 2), to: m.slice(2, 4), ...(m[4] && { promotion: m[4] }) };
    const next = classic.play(state, action, state.turn);
    if (!next) return null;
    state = next;
  }
  return state;
}

describe("classic", () => {
  it("starts from the initial position, white to move", () => {
    const state = classic.setup();
    const view = classic.view(state, "w");
    expect(Object.keys(view.pieces)).toHaveLength(32);
    expect(view.pieces.e1).toEqual({ color: "w", kind: "k" });
    expect(view.pieces.e7).toEqual({ color: "b", kind: "p", dir: "s" });
    expect(classic.toPlay(state)).toBe("w");
    expect(classic.status(state)).toEqual({ kind: "playing" });
  });

  it("lists the legal destinations of each piece of the side to move", () => {
    const { moves } = classic.view(classic.setup(), "w");
    expect(Object.keys(moves)).toHaveLength(10); // 8 pawns, 2 knights
    expect(moves.e2).toEqual(["e3", "e4"]);
    expect(new Set(moves.g1)).toEqual(new Set(["f3", "h3"]));
    expect(moves.e7).toBeUndefined();
  });

  it("accepts a legal move and rejects an illegal one", () => {
    const state = classic.setup();
    expect(classic.toPlay(classic.play(state, { from: "e2", to: "e4" }, "w")!)).toBe("b");
    expect(classic.play(state, { from: "e2", to: "e5" }, "w")).toBeNull();
    expect(classic.play(state, { from: "e7", to: "e5" }, "b")).toBeNull(); // not black's turn
  });

  it("detects scholar's mate", () => {
    const state = play("e2e4 e7e5 f1c4 b8c6 d1h5 g8f6 h5f7")!;
    expect(classic.status(state)).toEqual({ kind: "win", winner: "w", reason: "checkmate" });
    expect(classic.toPlay(state)).toBeNull();
    expect(classic.view(state, "spectator").check).toEqual(["e8"]);
    expect(classic.view(state, "spectator").moves).toEqual({});
    expect(classic.play(state, { from: "a7", to: "a6" }, "b")).toBeNull();
  });

  it("detects stalemate", () => {
    // Sam Loyd's ten-move stalemate.
    const state = play(
      "e2e3 a7a5 d1h5 a8a6 h5a5 h7h5 h2h4 a6h6 a5c7 f7f6 c7d7 e8f7 d7b7 d8d3 b7b8 d3h7 b8c8 f7g6 c8e6",
    )!;
    expect(classic.status(state)).toEqual({ kind: "draw", reason: "stalemate" });
  });

  it("promotes to a queen by default, or to the requested piece", () => {
    const moves = "h2h4 g7g5 h4g5 h7h6 g5h6 f8g7 h6g7 a7a6";
    expect(classic.view(play(`${moves} g7h8`)!, "w").pieces.h8).toEqual({ color: "w", kind: "q" });
    expect(classic.view(play(`${moves} g7h8n`)!, "w").pieces.h8).toEqual({ color: "w", kind: "n" });
    expect(play(`${moves} g7h8k`)).toBeNull();
    expect(classic.view(play(moves)!, "w").moves.g7).toEqual(["h8"]); // four promotions, one square
  });

  it("castles", () => {
    const state = play("e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 e1g1")!;
    const { pieces } = classic.view(state, "w");
    expect(pieces.g1).toEqual({ color: "w", kind: "k" });
    expect(pieces.f1).toEqual({ color: "w", kind: "r" });
  });
});
