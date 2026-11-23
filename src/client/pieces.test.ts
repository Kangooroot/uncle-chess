import { describe, expect, it } from "vitest";
import type { BoardView, ViewPiece } from "../core";
import { pieceRenderers } from "./pieces";

function view(pieces: Record<string, ViewPiece>): BoardView {
  return { pieces, turn: "w", lastMove: null, check: [], moves: {} };
}

describe("pieceRenderers", () => {
  // react-chessboard keeps drawing the previous position while it animates a
  // move: a piece type that just left the board must still have a renderer.
  it("keeps the renderers of piece types that just left the board", () => {
    const before = view({
      e1: { color: "w", kind: "k" },
      e8: { color: "b", kind: "k" },
      d5: { color: "b", kind: "n" },
    });
    const after = view({ e1: { color: "w", kind: "k" }, e8: { color: "b", kind: "k" } });

    pieceRenderers(before, "classic", false);
    expect(pieceRenderers(after, "classic", false).bn).toBeTypeOf("function");
  });

  it("keeps the renderer of a pawn whose direction just changed", () => {
    pieceRenderers(view({ h3: { color: "w", kind: "p", dir: "e" } }), "tourcoing", false);
    const after = pieceRenderers(view({ h3: { color: "w", kind: "p", dir: "n" } }), "tourcoing", false);

    expect(after["wp-e"]).toBeTypeOf("function");
    expect(after["wp-n"]).toBeTypeOf("function");
  });
});
