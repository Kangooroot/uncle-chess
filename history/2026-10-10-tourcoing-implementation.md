# Tourcoing chess implementation (PR 2)

Follows [`2026-10-09-tourcoing-spec-validated.md`](2026-10-09-tourcoing-spec-validated.md) and [`2026-10-09-chess-engine-implementation.md`](2026-10-09-chess-engine-implementation.md). Step 2 of the delivery plan of [`specs/ENGINE.md`](../specs/ENGINE.md), branch `feat/tourcoing-mode`.

## Done
- `src/modes/tourcoing/`: `tourcoingRules` = `classicRules` with the preset, a `rare-pawn` piece type (the generic `pawn` block, with its own `dir`), a promotion rule (pawn → unmoved rare pawn, white north, black west), `swapCastling`, and the endings `rarePawnGoal` (first), checkmate, stalemate, `repetition("loses")`, fifty moves, insufficient material.
- `src/chess/castling.ts`: generic `swapCastling`. The king swaps with an unmoved rook of its **rank or file**: in the start position the white rook a3 is on the king's file.
- Mode picker on the home screen. The creator's URL carries `?mode=<id>`; the room takes it on its first connection only, then the mode is fixed. Ids are looked up with `findMode` (`Object.hasOwn`), since they come from the network.
- Client-only `ModeUI` (`renderPiece`), registered in `src/modes/ui.ts` and excluded from the Worker's `tsconfig`. Tourcoing: an arrow on every pawn's square edge, turned with the board, and a pulsing gold halo plus gold arrow on rare pawns. The mode name is shown above the board.
- Tests following the spec: start position, pawn moves and captures, swap castling (file, rank, blocked, in check, through or onto an attacked square, rook moved), rare pawns (two-square move, en passant, captures, goal, promotion on the goal corner), repetition loses, and 30 random games played to the end.

## Choices
- **Rare pawn goal before checkmate and stalemate**: a move reaching the goal wins with the reason "rare pawn", even if it also mates or stalemates.
- **Castling is played by moving the king onto its rook** (`{ from: king, to: rook }`). The hint on the rook is the capture ring, which is a bit misleading but needs no new UI.
- react-chessboard piece types are now `color + kind + "-" + dir` (e.g. `wp-e`), and the client builds the renderers itself (the mode's drawing, else react-chessboard's classic pieces). Renderers are cached: react-chessboard uses them as components, a new function on every render would remount every piece.

## Points of attention
- A two-square move that promotes (an unmoved pawn two squares from its promotion line) would create an en passant target on a rare pawn. The start position cannot produce it; other presets could. The spec does not say what should happen.
- Old links: a room keeps its mode, `?mode=` on an existing room is ignored.
