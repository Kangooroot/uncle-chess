# Move hints, click-to-move and check highlight

Asked by Rémi: board interactions like chess.com. Spec in [`specs/UI.md`](../specs/UI.md).

## Decided
- The king's square turns **red** when it is in check.
- Clicking a piece shows its legal destinations: a **dot** on empty squares, a **ring** on captures. Clicking a destination plays the move. Drag and drop still works and shows the same hints.
- The legal destinations come from the mode, through a new `BoardView.moves` field (squares of the side to move → destination squares). The UI never computes rules itself, so the hints work for any mode, Tourcoing included.

## Points of attention
- `moves` lists destinations, not actions: with several actions to the same square (promotions), the UI sends `{ from, to }` and the mode's default applies. A promotion picker will need the options too.
- `view` now computes the legal moves, so it costs a few milliseconds per call.
