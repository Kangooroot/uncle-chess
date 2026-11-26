# French chess engine

Follows [`2026-11-06-french-chess.md`](2026-11-06-french-chess.md). First of two pull requests for French chess: the rules engine, with tests. The hexagonal board UI comes in the second one, which also adds the mode to the registry and the home screen.

## Decided
- **The mode lives in `src/modes/french/`**, outside the chess family: four boards and global legality do not fit `createChessMode`. It reuses the chess building blocks (`classicRules.pieces`, `standardCastling`, `promoteTo`, `parsePlacement`) one board at a time, through a classic `ChessState` built for that board.
- **Cells named `"red:e4"`**: the board, then the classic square. Readable in tests and logs; the hexagonal row and column are derived from it.
- **`GameMode<State, Action, View = BoardView>`**: the only contract change. French chess has its own `FrenchView` (classic and hexagonal destinations kept apart, forbidden boards, score). Existing modes and the registry are unchanged.
- **Not registered yet**: the client would try to draw the view on an 8x8 board.
- **Legality only re-checks the boards a move touches**, plus the boards where the mover is in check: a move can't change the others. About 3 ms per legal move list in mid-game.
- **Mates are resolved in `settle`**, right after the mating move: the board is emptied and forbidden, the score goes up, the history is cleared (a mate is irreversible), then the endings are checked for the mated player, who moves next.
- Endings in order: second mate, threefold repetition (the player who produced it loses), stalemate, insufficient material (both draws, unless a player leads on mates: then the leader wins).

## Points of attention
- Tests follow the spec: geometry (every inner hexagon touches both shades of the three other boards, the spec's distance table), hexagonal ranges and blocking, first rank, forbidden boards, interposition by a jump, the two-board check ban, mates and their consequences, endings, and a random game where every offered move is accepted.
- Random games almost never mate: worth watching during the first real games (see the open concern about mates being hard).
