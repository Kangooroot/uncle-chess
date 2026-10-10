# User interface

Two screens: home (nickname, game mode when creating, create or join a game) and game (mode name, board, players, status). UI text is in French (see [`MAIN.md`](MAIN.md)).

## Board

The board renders the mode's `BoardView` (see [`ENGINE.md`](ENGINE.md)) with react-chessboard. Interactions, in the style of chess.com (decided on 2026-10-09, see [`history/2026-10-09-move-hints.md`](../history/2026-10-09-move-hints.md)):

- **Moving a piece**: drag and drop it, or click it then click a destination.
- **Selection**: clicking one of your pieces, on your turn, selects it (yellow square) and shows its legal destinations (`BoardView.moves`). Clicking another of your pieces selects it instead; clicking the selected piece again or any other square cancels. Dragging a piece selects it too, so its destinations show while dragging. The selection is cleared after a move and whenever the server sends a new state.
- **Move hints**: a small grey dot in the centre of an empty destination, a grey ring around a piece that can be captured.
- **Check**: the square of a royal piece in check (`BoardView.check`) is red.
- **Promotion**: automatic, to the mode's default option (queen in classic chess, rare pawn in Tourcoing). A promotion picker will come later.
- **Mode drawings**: a mode can draw its pieces its own way (`ModeUI`). Tourcoing puts an arrow on each pawn, pointing where it moves, and a gold halo on rare pawns.
- **Castling by moving onto a rook** (Tourcoing's swap castling): the king's destination is the rook's square, shown with the capture ring.
- The player's side is at the bottom. Spectators and solo players see white at the bottom.
