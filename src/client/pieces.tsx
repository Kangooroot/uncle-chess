// Draws a mode's `BoardView` with react-chessboard: shared by the game board
// and the mode previews of the home screen.

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

// Renderers of every piece type seen so far, per mode and orientation. Kept
// across renders for two reasons: react-chessboard uses them as components (a new
// function would remount every piece), and while it animates a move it still
// draws the previous position, so a type that just left the board (last knight
// captured, pawn that changed direction) must keep its renderer.
const renderers = new Map<string, PieceRenderObject>();

/** Draws each piece type of the view: the mode's own drawing, or react-chessboard's classic pieces. */
export function pieceRenderers(view: BoardView, mode: string, flipped: boolean): PieceRenderObject {
  const key = `${mode} ${flipped}`;
  let known = renderers.get(key);
  if (!known) renderers.set(key, (known = {}));
  for (const piece of Object.values(view.pieces)) {
    if (!piece) continue;
    const type = pieceType(piece);
    if (known[type]) continue;
    const fallback = defaultPieces[piece.color + piece.kind.toUpperCase()];
    known[type] = () => modeUIs[mode]?.renderPiece(piece, flipped) ?? fallback?.() ?? <span>{piece.kind}</span>;
  }
  return { ...known };
}
