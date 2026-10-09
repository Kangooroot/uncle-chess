import { describe, expect, it } from "vitest";
import { classic } from "./classic";
import type { Move } from "./index";

const m = (from: string, to: string): Move => ({ from, to });

describe("classic", () => {
  it("starts from the initial position, white to move", () => {
    const pos = classic.position([]);
    expect(pos.fen).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    expect(pos.turn).toBe("w");
    expect(pos.status).toEqual({ kind: "playing" });
  });

  it("accepts a legal move and rejects an illegal one", () => {
    expect(classic.play([], m("e2", "e4"))?.turn).toBe("b");
    expect(classic.play([], m("e2", "e5"))).toBeNull();
    expect(classic.play([], m("e7", "e5"))).toBeNull(); // not black's turn
  });

  it("detects scholar's mate", () => {
    const moves = [m("e2", "e4"), m("e7", "e5"), m("f1", "c4"), m("b8", "c6"), m("d1", "h5"), m("g8", "f6")];
    const pos = classic.play(moves, m("h5", "f7"));
    expect(pos?.status).toEqual({ kind: "checkmate", winner: "w" });
    expect(classic.play([...moves, m("h5", "f7")], m("a7", "a6"))).toBeNull();
  });

  it("handles promotion", () => {
    // prettier-ignore
    const moves = [
      m("h2", "h4"), m("g7", "g5"), m("h4", "g5"), m("h7", "h6"),
      m("g5", "h6"), m("f8", "g7"), m("h6", "g7"), m("a7", "a6"),
    ];
    const pos = classic.play(moves, { from: "g7", to: "h8", promotion: "q" });
    expect(pos?.fen.split(" ")[0]).toMatch(/^rnbqk1nQ\//);
  });
});
