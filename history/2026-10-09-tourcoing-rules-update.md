# Tourcoing chess: start position and rare pawns

Follows [`2026-10-08-tourcoing-mode.md`](2026-10-08-tourcoing-mode.md).

## Decided
- **Start position** given as a mockup and transcribed in [`specs/modes/tourcoing.md`](../specs/modes/tourcoing.md): 15 pieces per side (7 pawns), white around a1, black around h8. FEN placement `3pbr1k/4pnq1/4ppnr/P4ppb/1PP4p/RNPP4/BQNP4/KBR1P3`.
- **Promotion** is always into a **rare pawn**, and only into a rare pawn.
- **Rare pawn** = a pawn that turned 90°: white east → north, black south → west. Its promotion square counts as a starting square (2-square move allowed, en passant possible). Reaching the board edge in its new direction wins immediately.

## Noticed
- The two armies are mirror images across the a8–h1 diagonal, **except the bishops** (white a2/b1, black e8/h5; mirrors would be g8/h7). All four bishops are on light squares. Asked whether this is intended.
- Pawn directions and rare pawn directions follow the same diagonal mirror, which keeps the mode fair.

## Open
- Bishop placement (intended or not).
- Hyperpawns: gone (merged into the rare pawn), or still a separate thing?
- Which pawns can make a 2-square move (proposal: any pawn that has not moved yet).
- En passant between perpendicular pawns (proposal: yes, generic rule).
- Pawn promoted on h8 / a1, already on the rare pawn goal.
