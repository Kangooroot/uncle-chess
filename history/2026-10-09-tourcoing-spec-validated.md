# Tourcoing chess: spec validated

Follows [`2026-10-09-tourcoing-rules-update.md`](2026-10-09-tourcoing-rules-update.md). The spec [`specs/modes/tourcoing.md`](../specs/modes/tourcoing.md) is now validated.

## Answers
- **Bishops**: the asymmetry is intended. All four bishops are on light squares.
- **Hyperpawn = rare pawn**: one concept, named "rare pawn" (or "promoted pawn"). The name "hyperpawn" is dropped. Rare pawns need a visual gimmick, characteristic of the mode.
- **Two-square move**: allowed for a pawn that has not moved yet, or that has just been promoted into a rare pawn. The pawn can then be taken en passant on the skipped square by any enemy pawn attacking it.
- **En passant between perpendicular pawns**: yes, same generic rule.
- **Promotion on a corner already on the rare pawn goal** (white h8, black a1): immediate win. The start position avoids it on purpose (no white pawn on rank 8), but the rule covers other presets.

## Next
Design how to extend chess with custom rules: the `Variant` → `GameMode` migration and the in-house engine (`src/engine/`). This will be a big PR, to review carefully.
