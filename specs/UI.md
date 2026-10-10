# User interface

Two screens: home (nickname, create or join a game) and game (board, players, status). UI text is in French (see [`MAIN.md`](MAIN.md)).

## Board

The board renders the mode's `BoardView` (see [`ENGINE.md`](ENGINE.md)) with react-chessboard. Interactions, in the style of chess.com (decided on 2026-10-09, see [`history/2026-10-09-move-hints.md`](../history/2026-10-09-move-hints.md)):

- **Moving a piece**: drag and drop it, or click it then click a destination.
- **Selection**: clicking one of your pieces, on your turn, selects it (yellow square) and shows its legal destinations (`BoardView.moves`). Clicking another of your pieces selects it instead; clicking the selected piece again or any other square cancels. Dragging a piece selects it too, so its destinations show while dragging. The selection is cleared after a move and whenever the server sends a new state.
- **Move hints**: a small grey dot in the centre of an empty destination, a grey ring around a piece that can be captured.
- **Check**: the square of a royal piece in check (`BoardView.check`) is red.
- **Promotion**: automatic, to the mode's default option (queen in classic chess). A promotion picker will come later.
- The player's side is at the bottom. Spectators and solo players see white at the bottom.
