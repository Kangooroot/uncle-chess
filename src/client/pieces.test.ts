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
    const renderers = pieceRenderers();
    const before = view({
      e1: { color: "w", kind: "k" },
      e8: { color: "b", kind: "k" },
      d5: { color: "b", kind: "n" },
    });
    const after = view({ e1: { color: "w", kind: "k" }, e8: { color: "b", kind: "k" } });

    renderers(before, false);
    expect(renderers(after, false).bn).toBeTypeOf("function");
  });

  it("keeps the renderer of a pawn whose direction just changed", () => {
    const renderers = pieceRenderers(() => null);
    renderers(view({ h3: { color: "w", kind: "p", dir: "e" } }), false);
    const after = renderers(view({ h3: { color: "w", kind: "p", dir: "n" } }), false);

    expect(after["wp-e"]).toBeTypeOf("function");
    expect(after["wp-n"]).toBeTypeOf("function");
  });

  it("keeps one set of renderers per orientation", () => {
    const renderers = pieceRenderers();
    const position = view({ e1: { color: "w", kind: "k" } });
    expect(renderers(position, false).wk).not.toBe(renderers(position, true).wk);
    expect(renderers(position, false).wk).toBe(renderers(position, false).wk);
  });
});
