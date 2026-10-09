# Tourcoing chess: first game mode

## Context
Rémi picked "Tourcoing chess", invented by his uncle, as the first non-classic mode. He gave a short summary of its rules, then answered a first round of questions.

## Decided
- **Armies in opposite corners**: white around a1 (king on a1), black around h8 (king on h8).
- **Start position = preset data** (JSON or similar), not hard-coded. Rémi will provide a mockup.
- **Pawn direction is the core of the mode**: white pawns move right (towards the h-file), black pawns move down (towards rank 1). Pawns of the two sides never face each other.
- **Castling** keeps the classic conditions; its effect is a king ↔ rook swap.
- **Promotion** into a pawn is allowed and gives a "rare pawn". Pawns and rare pawns can become hyperpawns (1 or 2 squares per move).
- A **hyperpawn** reaching its promotion line wins; a rare pawn does not.
- **Threefold repetition**: the player whose move creates the third occurrence loses, automatically.
- Other endings stay classic unless stated otherwise.

## Dropped
- The "fou fou" piece starting on h2: it was only part of the special start position, which now comes from the preset.
- "No promotion into an opponent's piece": not worth a rule.

## Open
- How a pawn becomes a hyperpawn, and its capture / jump / en passant rules (Rémi is checking).
- Where a rare pawn goes and which direction it moves in.
- En passant and sideways blocking between perpendicular pawns.
- Start position mockup.

## Next
Once the spec is validated: design how to extend chess for custom rules. This is the trigger for the `Variant` → `GameMode` migration and the in-house engine.
