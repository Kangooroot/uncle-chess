# Chess engine design

Follows [`2026-10-09-tourcoing-spec-validated.md`](2026-10-09-tourcoing-spec-validated.md). Proposal written in [`specs/ENGINE.md`](../specs/ENGINE.md), to review before implementation.

## Decided in discussion
- **chess.js leaves production.** Our engine runs every mode, classic included. chess.js stays as a dev dependency, to check our classic rules in tests.
- **The mode is chosen when the game is created**, then fixed in the room (closes an open question of `GAME-MODES.md`).
- **Three layers**: `src/core/` (all games), `src/chess/` (chess family), `src/modes/` (classic, Tourcoing, later others). Dependencies only point up; nothing Tourcoing-specific in `src/chess/`. Games not based on chess implement `GameMode` directly with `src/core/` only.
- **A mode is a configuration** (`ChessRules`: setup, pieces, castling, promotion, endings) built from classic defaults with overrides (`{ ...classicRules, ... }`), not a class hierarchy.
- **State is plain JSON, behaviour is plain objects.** Rémi first suggested `Piece` classes extended by inheritance (e.g. to add a direction). Rejected for the state: class instances lose their prototype through JSON (Durable Object storage, WebSocket). Classes would have been fine for behaviours, but objects of functions were preferred, consistent with the `GameMode` contract.
- **Each pawn carries its direction**: the classic pawn already has one (implicit north/south), so it belongs to the base pawn, not to a Tourcoing extension.
- **Old games are not migrated** (decision A): a room with the old stored format starts a new game.
- **Classic promotion stays automatic** (decision B): the queen is the default promotion option; a promotion picker comes later, in its own PR.
- **Mode picker on the home page** (decision C), in the Tourcoing PR.

## Proposed (to review)
- `moved` flag per piece instead of castling rights and "second rank" tests.
- En passant stores the skipped square and the pawn to capture (perpendicular pawns).
- Status stored in the state, computed by ordered ending rules after each move.
- Generic `Status` with a `reason` string and display text per mode.
- Protocol carries the mode's state; the client computes the view. Hidden-information modes will need server-side views later.
- How Tourcoing maps onto it: a `rare-pawn` piece kind reusing the pawn movement; promotion rule `p` → `rare-pawn` turned 90° with `moved: false`; `swapCastling`; ending rules "rare pawn on its goal" and `repetition("loses")`.

## Delivery
Two PRs: `refactor/chess-engine` (classic on the new engine, no visible change), then `feat/tourcoing-mode`.

## Open
- Resignation is listed as an ending in the specs but does not exist yet: out of scope.
- Server-side views for hidden-information modes: later.
