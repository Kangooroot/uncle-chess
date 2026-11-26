// Maps a `BoardView`'s pieces to react-chessboard pieces, for the 8x8 board.

import type { ReactElement } from "react";
import { defaultPieces, type PieceRenderObject, type PositionDataType } from "react-chessboard";
import type { BoardView, ViewPiece } from "../core";

/** A mode's own drawing of a piece, or `null` for the default drawing. `flipped`: black at the bottom. */
export type RenderPiece = (piece: ViewPiece, flipped: boolean) => ReactElement | null;

/** react-chessboard piece type: colour first (see `canDragPiece`), then kind and direction, e.g. "wp-n". */
function pieceType(piece: ViewPiece): string {
  return piece.color + piece.kind + (piece.dir ? `-${piece.dir}` : "");
}

export function toPosition(view: BoardView): PositionDataType {
  const position: PositionDataType = {};
  for (const [square, piece] of Object.entries(view.pieces)) {
    if (piece) position[square] = { pieceType: pieceType(piece) };
  }
  return position;
}

/**
 * Draws each piece type of a view: `renderPiece`'s drawing, or
 * react-chessboard's classic pieces.
 *
 * The renderers of every piece type seen so far are kept, per orientation, for
 * two reasons: react-chessboard uses them as components (a new function would
 * remount every piece), and while it animates a move it still draws the
 * previous position, so a type that just left the board (last knight captured,
 * pawn that changed direction) must keep its renderer.
 */
export function pieceRenderers(renderPiece?: RenderPiece): (view: BoardView, flipped: boolean) => PieceRenderObject {
  const renderers = new Map<boolean, PieceRenderObject>();
  return (view, flipped) => {
    let known = renderers.get(flipped);
    if (!known) renderers.set(flipped, (known = {}));
    for (const piece of Object.values(view.pieces)) {
      if (!piece) continue;
      const type = pieceType(piece);
      if (known[type]) continue;
      const fallback = defaultPieces[piece.color + piece.kind.toUpperCase()];
      known[type] = () => renderPiece?.(piece, flipped) ?? fallback?.() ?? <span>{piece.kind}</span>;
    }
    return { ...known };
  };
}
