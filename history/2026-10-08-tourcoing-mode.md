# Tourcoing chess: first game mode

## Context
Rémi picked "Tourcoing chess", invented by his uncle, as the first non-classic mode. He gave a short summary of its specific rules. The detailed rules are in an earlier claude.ai conversation, which Claude Code cannot read.

## Rule summary (as given)
- Kings in the corners.
- "Fou fou" (crazy bishop): starts on h2.
- Castling = king ↔ rook swap.
- Promotion into a pawn allowed; no opponent's piece.
- A pawn can become a hyperpawn; a hyperpawn moves 1 or 2 squares.
- A hyperpawn reaching the last rank wins; a rare pawn reaching it does not.
- A rare pawn can become a hyperpawn.
- Threefold repetition: the player loses.

## Done
Draft spec in [`specs/modes/tourcoing.md`](../specs/modes/tourcoing.md), with every ambiguity listed as "To confirm".

## Next
1. Validate the spec together (answer the "To confirm" points).
2. Then design how to extend chess for custom rules. This is the trigger for the `Variant` → `GameMode` migration and the in-house engine.
