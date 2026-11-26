// The 8x8 board of the chess modes, drawn with react-chessboard: the game
// board (click or drag to move, move hints in the style of chess.com) and the
// home screen preview. Interactions in specs/UI.md.

import { useId, useState, type CSSProperties } from "react";
import { Chessboard, type PieceDropHandlerArgs, type PieceHandlerArgs, type SquareHandlerArgs } from "react-chessboard";
import type { BoardView, Square } from "../core";
import type { BoardProps, ModeUI } from "../modes/ui";
import { pieceRenderers, toPosition, type RenderPiece } from "./pieces";

/** The UI of a mode on a single 8x8 board, its pieces drawn by `renderPiece` (default: classic pieces). */
export function squareBoardUI(renderPiece?: RenderPiece): ModeUI<BoardView> {
  const renderers = pieceRenderers(renderPiece);

  function Board({ view, player, flipped, play }: BoardProps<BoardView>) {
    // Piece clicked (or being dragged) by the player: its legal destinations
    // are shown. Tied to the view it was made on, so it is cleared after a
    // move and whenever the server sends a new state.
    const [selection, setSelection] = useState<{ view: BoardView; square: Square } | null>(null);
    const selected = selection?.view === view ? selection.square : null;
    const select = (square: Square | null) => setSelection(square === null ? null : { view, square });

    const targets = (player && selected && view.moves[selected]) || [];
    const canSelect = (square: Square) => player !== null && view.pieces[square]?.color === player;

    function move(from: Square, to: Square): boolean {
      select(null);
      return play({ from, to });
    }

    // Click a piece to see its moves, then click one of them to play it. Clicking the
    // selected piece again, or any other square, cancels the selection.
    function onSquareClick({ square }: SquareHandlerArgs) {
      if (selected && targets.includes(square)) move(selected, square);
      else select(square !== selected && canSelect(square) ? square : null);
    }

    function onPieceDrag({ square }: PieceHandlerArgs) {
      if (square && canSelect(square)) select(square);
    }

    function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean {
      // Dropped back on its square: keep the piece selected, like a click.
      if (!targetSquare || targetSquare === sourceSquare) return false;
      return move(sourceSquare, targetSquare);
    }

    return (
      <Chessboard
        options={{
          id: "game",
          position: toPosition(view),
          pieces: renderers(view, flipped),
          boardOrientation: flipped ? "black" : "white",
          allowDragging: player !== null,
          canDragPiece: ({ piece }) => piece.pieceType[0] === player,
          squareStyles: squareStyles(view, selected, targets),
          onSquareClick,
          onPieceDrag,
          onPieceDrop,
        }}
      />
    );
  }

  function Preview({ view }: { view: BoardView }) {
    // react-chessboard builds DOM ids from it: keep letters and digits only.
    const id = `preview-${useId().replace(/\W/g, "")}`;
    return (
      <Chessboard
        options={{
          id,
          position: toPosition(view),
          pieces: renderers(view, false),
          allowDragging: false,
          showNotation: false,
          showAnimations: false,
        }}
      />
    );
  }

  return { Board, Preview };
}

// Board highlights, in the style of chess.com.
const SELECTED: CSSProperties = { background: "rgba(255, 255, 51, 0.5)" };
const CHECK: CSSProperties = { background: "rgba(235, 64, 52, 0.85)" };
const HINT = "rgba(0, 0, 0, 0.14)";
const MOVE_HINT: CSSProperties = {
  background: `radial-gradient(circle closest-side, ${HINT} 33%, transparent 35%)`,
  cursor: "pointer",
};
const CAPTURE_HINT: CSSProperties = {
  background: `radial-gradient(circle closest-side, transparent 80%, ${HINT} 82%, ${HINT} 98%, transparent 100%)`,
  cursor: "pointer",
};

function squareStyles(view: BoardView, selected: Square | null, targets: Square[]): Record<Square, CSSProperties> {
  const styles: Record<Square, CSSProperties> = {};
  if (selected) styles[selected] = SELECTED;
  for (const square of view.check) styles[square] = CHECK;
  for (const square of targets) styles[square] = view.pieces[square] ? CAPTURE_HINT : MOVE_HINT;
  return styles;
}
