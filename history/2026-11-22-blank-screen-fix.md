# Blank screen during games

## Symptom
In production, after a while, the game screen sometimes went blank.

## Cause
`pieceRenderers` (`src/client/pieces.tsx`) gave react-chessboard a renderer only for the piece types present in the **current** view. But when react-chessboard animates a move (opponent's move, or a move played by clicking), it keeps drawing the **previous** position for 300 ms. If a piece type had just left the board (the last black knight captured, a Tourcoing pawn that changed direction on promotion…), react-chessboard looked up a missing renderer, React threw while rendering, and with no error boundary it unmounted the whole app.

That is why it happened "after a while": it needs the last piece of a type to disappear.

## Fix
- Renderers now accumulate per mode and orientation: every piece type seen keeps its renderer. Covered by `src/client/pieces.test.ts`.
- `ErrorBoundary` around the app: any future render error shows a French message with a reload button instead of a blank page (the game itself lives on the server and is not lost).

## Points of attention
- A custom piece drawn for a mode must keep a stable piece type string per (kind, colour, direction): the renderer cache is keyed by it.
