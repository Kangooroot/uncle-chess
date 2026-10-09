# Tourcoing chess

> **Status: validated** on 2026-10-09. Ready for implementation.

Mode id: `tourcoing`. First non-classic mode of the platform: a **close mode** (see [`../GAME-MODES.md`](../GAME-MODES.md)), i.e. classic chess with the changes below. Anything not mentioned here follows classic chess rules. White moves first.

## 1. Setup

### 1.1 Armies in opposite corners
The two armies do not face each other across the board. Each one is gathered around a corner: **white around a1**, **black around h8**. Each side has 15 pieces: king, queen, 2 rooks, 2 bishops, 2 knights and **7 pawns**.

```
  8  .  .  .  p  b  r  .  k
  7  .  .  .  .  p  n  q  .
  6  .  .  .  .  p  p  n  r
  5  P  .  .  .  .  p  p  b
  4  .  P  P  .  .  .  .  p
  3  R  N  P  P  .  .  .  .
  2  B  Q  N  P  .  .  .  .
  1  K  B  R  .  P  .  .  .
     a  b  c  d  e  f  g  h
```

Uppercase = white, lowercase = black. FEN placement: `3pbr1k/4pnq1/4ppnr/P4ppb/1PP4p/RNPP4/BQNP4/KBR1P3`.

| Piece | White | Black |
|---|---|---|
| King | a1 | h8 |
| Queen | b2 | g7 |
| Rooks | a3, c1 | f8, h6 |
| Bishops | a2, b1 | e8, h5 |
| Knights | b3, c2 | f7, g6 |
| Pawns | a5, b4, c4, c3, d3, d2, e1 | d8, e7, e6, f6, f5, g5, h4 |

The black army is the mirror image of the white army across the **a8–h1 diagonal** (square `(file, rank)` ↔ `(9 − rank, 9 − file)`), **except the bishops**, on purpose: **all four bishops are on light squares** (white a2 and b1, black e8 and h5).

No white pawn starts on rank 8 and no black pawn on the a-file: such a pawn would already stand on its rare pawn goal (see 4.3).

### 1.2 Start position is data
The placement above is stored as a **preset** (data, e.g. JSON or FEN), not hard-coded in the rules, so it can be adjusted without touching code.

## 2. Pawn direction

This is the core of the mode: **pawns of the two sides do not move toward each other**.

| Side | Forward | Promotion line | Example |
|---|---|---|---|
| White | **east**: towards the h-file | the **h-file** | c3 → d3 |
| Black | **south**: towards rank 1 | **rank 1** | f6 → f5 |

The two directions are mirror images across the a8–h1 diagonal, like the armies. Every pawn rule is applied along the pawn's direction:

- a pawn moves one square forward onto an empty square, or **two squares** if both are empty and the pawn **has not moved yet** or **has just been promoted** into a rare pawn (see 4.2);
- it captures one square **diagonally forward** (white on c3 captures on d2 or d4; black on f6 captures on e5 or g5);
- **en passant**: a pawn that has just moved two squares can be captured on the square it skipped, by any enemy pawn that attacks that square, on the very next move only. Pawns of the two sides move perpendicular to each other, so en passant is checked against the capture squares of each enemy pawn, whatever its direction (e.g. white c3 → e3 can be taken on d3 by a black pawn on c4 or e4);
- on reaching its promotion line, it is promoted (see 4).

## 3. Castling
Castling **swaps the king and a rook**: each takes the other's square.

The classic conditions still apply:

- neither the king nor that rook has moved;
- every square between them is empty;
- the king is not in check, does not pass through an attacked square and does not land on one (the squares the king passes through are those between its start and target squares).

In the start position, white can castle with a3 once a2 is empty, and with c1 once b1 is empty (mirrored for black).

## 4. Promotion and rare pawns

The promoted piece is called a **rare pawn** (or **promoted pawn**). Earlier notes also called it "hyperpawn": it is the same thing, and that name is dropped.

### 4.1 Promotion
A pawn reaching its promotion line is **always promoted into a rare pawn**, and only into a rare pawn. There is no choice to make (no promotion picker).

### 4.2 Rare pawn
A rare pawn is a pawn that has **turned 90°**:

| Side | Pawn direction | Rare pawn direction | Rare pawn's goal |
|---|---|---|---|
| White | east | **north** | rank 8 |
| Black | south | **west** | the a-file |

A rare pawn follows all pawn rules in its new direction, and its promotion square counts as a **starting square**:

- on its first move after promotion, it can move one or two squares;
- if it moves two squares, it can be captured en passant;
- it captures diagonally forward in its new direction (a white rare pawn on h3 captures on g4; a black rare pawn on c1 captures on b2).

### 4.3 Winning with a rare pawn
A rare pawn reaching its goal (rank 8 for white, the a-file for black) **wins the game immediately**.

A pawn promoted on a corner that is already on its rare pawn goal (white on **h8**, black on **a1**) **wins immediately** too. The start position avoids it, but the rule covers any other preset.

## 5. Game endings

### 5.1 Rare pawn win
See 4.3. The move must still be legal (it cannot leave its own king in check).

### 5.2 Threefold repetition
A threefold repetition is **not a draw**: the player whose move produces the third occurrence of the position **loses**. This is detected and applied automatically, with no claim needed.

### 5.3 Unchanged
Unless stated otherwise, the other endings stay classic: checkmate wins; stalemate, the fifty-move rule and insufficient material are draws; resignation.

## 6. Implementation notes

- Not implementable with chess.js: custom start position, sideways pawns, rotating rare pawns, swap castling, new win conditions. This mode triggers the migration described in [`../GAME-MODES.md`](../GAME-MODES.md) (`Variant` → `GameMode`, in-house `src/engine/`).
- The engine's pawn block takes a **direction per pawn** (not per side): a rare pawn has a different direction from the other pawns of its side.
- State tracks, for each pawn: its kind (pawn or rare pawn) and whether it is still on a starting square. Plus the en passant square and the position history (for the repetition rule).
- The start position comes from a preset, which is also useful for other modes.
- UI needs: a **visual gimmick for rare pawns**, characteristic of this mode, and something that makes each pawn's direction readable at a glance (it is unusual). No promotion picker.
