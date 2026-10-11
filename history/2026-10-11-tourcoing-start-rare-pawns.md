# Tourcoing chess: a rare pawn in each starting army

Asked by the user after the home screen was merged. Branch `feat/tourcoing-rare-pawns-setup`. Updates the start position of [`2026-10-09-tourcoing-rules-update`](2026-10-09-tourcoing-rules-update.md).

## Decided
- Each side starts with one **rare pawn** (already promoted) on top of its 15 pieces: **white on h2, moving north**; **black on g1, moving west**. The two squares are mirror images across the a8–h1 diagonal, like the rest of the armies.
- New placement: `3pbr1k/4pnq1/4ppnr/P4ppb/1PP4p/RNPP4/BQNP3X/KBR1P1x1`.
- These rare pawns count as **unmoved**: like a freshly promoted pawn, their first move can be one or two squares (and can be taken en passant). Not explicitly stated by the user; follows rule 4.2 of the spec.

## Implementation
- The FEN placement could only express classic piece letters. `Preset` gains an optional `letters` map: an extra FEN letter to a piece type and its direction per side. Tourcoing maps `x` to the rare pawn. Classic chess is unchanged.
- In the start position both rare pawns are blocked from moving two squares (h4 and e1 are taken).

## Points of attention
- Black's g1 rare pawn is next to white's e1 pawn, whose path east goes f1 then g1: they block each other at the start.
