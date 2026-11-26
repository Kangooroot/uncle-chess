# French chess client: plan and first step

Date: 2026-11-26. Follows [2026-11-24-french-chess-engine](2026-11-24-french-chess-engine.md).

## Context

The French chess engine is merged (PR #19) but not registered: the client only drew 8x8 boards. `Game.tsx` and the home mode cards called react-chessboard directly and assumed a `BoardView` (squares like `"e4"`, `view.moves[square]`).

## Plan

Three pull requests:

1. **Refactor, no visible change**: each mode provides its board. `ModeUI` becomes `{ Board, Preview }`; the 8x8 modes use `squareBoardUI(renderPiece?)` (react-chessboard, moved out of `Game.tsx` and `Home.tsx`); the game screen keeps the connection, the optimistic display, the header and the status line; the mode registry accepts any view sharing `BaseView` (`turn`, `check`).
2. **The hexagonal board, playable**: SVG renderer of the 256 hexagons with the four-hue palette of the chosen mockup, move hints (dot or ring for classic moves, small white hexagon for hexagonal moves, other boards dimmed), last move, check, forbidden boards, score, a hexagonal preview on the mode card, the mode registered, and the home order Tourcoing, French, classic (see [`../specs/UI.md`](../specs/UI.md)).
3. **Navigation and finishing touches**: zoom (wheel, +/− buttons, pinch), panning, the rules modal, a colour-blindness check of red and green.

## Decisions

- **Dragging on the hexagonal board**: a drag that starts on one of the player's pieces moves the piece; any other drag pans the zoomed board. Click-to-move works too.
- **Rules modal for every mode**, with a text provided by each mode (not only French chess).

## Step 1 notes

- The board's selection is tied to the view object it was made on, so it clears itself after a move and when the server sends a new state. The game screen memoizes the view on the drawn state for that.
- `pieceRenderers(renderPiece?)` is now a factory: each square board UI keeps its own piece renderers, per orientation (the cache that fixed the blank screen of [2026-11-22-blank-screen-fix](2026-11-22-blank-screen-fix.md)).
- A test checks that every mode of the registry has a UI.
