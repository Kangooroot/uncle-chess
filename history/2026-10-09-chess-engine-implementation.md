# Chess engine implementation (PR 1)

Follows [`2026-10-09-chess-engine-design.md`](2026-10-09-chess-engine-design.md). Implements step 1 of the delivery plan of [`specs/ENGINE.md`](../specs/ENGINE.md): classic chess on the new engine, branch `refactor/chess-engine`.

## Done
- `src/core/` (contract, geometry), `src/chess/` (engine, building blocks, `classicRules`, `createChessMode`), `src/modes/` (registry, `classic`). `src/rules/` and chess.js in production are gone; chess.js is a dev dependency.
- Protocol carries the mode's state (`GameState.state`) and untrusted actions (`{ type: "action", action }`). The server stores `{ version: 2, mode, state, tokens, names }`; older rooms start a new game, players included (decision A).
- The client computes `view(state, seat)` and maps it to react-chessboard. Status text comes from the mode's `reasons` (draws now say why, e.g. "Draw: stalemate.").
- Tests: perft against chess.js on the start position and five standard tricky positions (depth 3, or 4), 20 seeded random games comparing legal moves and status at every ply, targeted tests for repetition, perpendicular pawns and en passant between them.

## Deviations from the proposal
- **Position key leaves `moved` out.** The proposal keyed every field of every piece; then Nf3 Nf6 Ng1 Ng8 would never repeat the start position (the knights are "moved"), unlike the FIDE rule and chess.js. The key is type, colour and direction of each piece, the side to move, castling rights and the en passant target only when it can be taken.
- **`CastlingRule.rights(board, king)`** added, to put castling rights in the key without knowing the castling rule. `moves` gets an `attacked(square, by)` helper.
- **`PieceKind.moves` takes the state** (en passant), and squares inside `src/chess/` are indices.
- `ChessContext` became `EndingContext = { legalMoves, inCheck }`: the history is in the state.

## Points of attention
- Performance: legality is checked by scanning every enemy piece's attacks after each candidate move. Fine for play (a few ms per move); perft is kept at depth 3–4 in tests.
- Unknown actions keys are ignored; a `promotion` on a move that does not promote is rejected.
- The UI does not highlight `check` squares yet (the status text says "Check!"), to keep the PR free of visible changes.
