// Draws a mode's `BoardView` with react-chessboard: shared by the game board
// and the mode previews of the home screen.

import type { ReactElement } from "react";
import { defaultPieces, type PieceRenderObject, type PositionDataType } from "react-chessboard";
import type { BoardView, ViewPiece } from "../core";
import { modeUIs } from "../modes/ui";

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

// Kept across renders: react-chessboard uses them as components, a new
// function would remount every piece.
const renderers = new Map<string, () => ReactElement>();

/** Draws each piece type of the view: the mode's own drawing, or react-chessboard's classic pieces. */
export function pieceRenderers(view: BoardView, mode: string, flipped: boolean): PieceRenderObject {
  const result: PieceRenderObject = {};
  for (const piece of Object.values(view.pieces)) {
    if (!piece) continue;
    const type = pieceType(piece);
    const key = `${mode} ${flipped} ${type}`;
    let render = renderers.get(key);
    if (!render) {
      const fallback = defaultPieces[piece.color + piece.kind.toUpperCase()];
      render = () => modeUIs[mode]?.renderPiece(piece, flipped) ?? fallback?.() ?? <span>{piece.kind}</span>;
      renderers.set(key, render);
    }
    result[type] = render;
  }
  return result;
}
