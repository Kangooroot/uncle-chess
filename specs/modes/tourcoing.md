# Tourcoing chess

> **Status: draft.** The points marked **To confirm** must be settled before implementation.

Mode id: `tourcoing`. First non-classic mode of the platform: a **close mode** (see [`../GAME-MODES.md`](../GAME-MODES.md)), i.e. classic chess with the changes below. Anything not mentioned here follows classic chess rules.

## 1. Setup

### 1.1 Armies in opposite corners
The two armies do not face each other across the board. Each one is gathered around a corner:

- **white** around **a1**, with the white king **on a1**;
- **black** around **h8**, with the black king **on h8**.

### 1.2 Start position is data
The exact placement of the pieces is a **preset**: a data file (e.g. JSON) describing the piece on each square. It is not hard-coded in the rules, so it can be adjusted without touching code.

- **To do:** Rémi will provide the mockup of the start position, from which the preset is written.

## 2. Pawn direction

This is the core of the mode: **pawns of the two sides do not move toward each other**.

| Side | "Forward" | Promotion line | Example |
|---|---|---|---|
| White | **right**: towards the h-file (file +1) | the **h-file** | c3 → d3 |
| Black | **down**: towards rank 1 (rank −1) | **rank 1** | f6 → f5 |

Every pawn rule is applied along that direction:

- a pawn moves one square forward, or two from its starting square;
- it captures one square **diagonally forward** (white on c3 captures on d2 or d4; black on f6 captures on e5 or g5);
- en passant works the same way, along the pawn's direction;
- it promotes when it reaches its promotion line.

- **To confirm:** a white pawn and a black pawn now move on perpendicular lines. Is en passant kept? Can a pawn be blocked sideways by an enemy pawn crossing its path? (Both follow naturally from the rules above, but they will feel unusual in play.)

## 3. Castling
Castling **swaps the king and a rook**: each takes the other's square.

The classic conditions still apply:

- neither the king nor that rook has moved;
- every square between them is empty;
- the king is not in check, does not pass through an attacked square and does not land on one (the squares the king "passes through" are those between its start and target squares).

## 4. Promotion, rare pawns and hyperpawns

### 4.1 Vocabulary
- **Pawn**: a pawn with the direction rules above.
- **Rare pawn**: a pawn obtained by promotion (see 4.2).
- **Hyperpawn**: an upgraded pawn that can always move **1 or 2 squares** forward.

### 4.2 Promotion
On reaching its promotion line, a pawn promotes as in classic chess (queen, rook, bishop, knight), **or into a pawn**. The result is then a **rare pawn**.

- **To confirm:** a rare pawn appears on the promotion line, where it can no longer move forward. Where does it go, and in which direction does it move afterwards?

### 4.3 Hyperpawn
- A pawn can become a **hyperpawn**. A **rare pawn** can too.
- A hyperpawn moves **1 or 2 squares** forward on every move, not only its first one.
- **To confirm (Rémi is checking):** how and when does a pawn become a hyperpawn? Does it capture like a pawn? Can it jump over a piece on its 2-square move? Does en passant apply to it?

## 5. Game endings

### 5.1 New win conditions
- A **hyperpawn** reaching its promotion line **wins the game** for its owner.
- A **rare pawn** reaching it does **not** win.

### 5.2 Threefold repetition
A threefold repetition is **not a draw**: the player whose move produces the third occurrence of the position **loses**. This is detected and applied automatically, with no claim needed.

### 5.3 Unchanged
Unless stated otherwise, the other endings stay classic: checkmate wins; stalemate, the fifty-move rule and insufficient material are draws; resignation.

## 6. Implementation notes

- Not implementable with chess.js: custom start position, sideways pawns, swap castling, pawn kinds, new win conditions. This mode triggers the migration described in [`../GAME-MODES.md`](../GAME-MODES.md) (`Variant` → `GameMode`, in-house `src/engine/`).
- The engine's pawn block must take a **direction per side** as a parameter, not assume "up for white, down for black".
- The start position comes from a preset file, which is also useful for other modes.
- State must track each pawn's kind (pawn, rare pawn, hyperpawn) and the position history (for the repetition rule).
- UI needs: a visual distinction for rare pawns and hyperpawns, a promotion picker with a pawn option, a way to turn a pawn into a hyperpawn, and something that makes the pawn direction readable at a glance (it is unusual).
