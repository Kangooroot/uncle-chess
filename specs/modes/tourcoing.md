# Tourcoing chess

> **Status: draft.** Written from a short rule summary. Every point marked **To confirm** must be settled before implementation. The detailed rules live in an earlier conversation that Claude could not access.

Mode id: `tourcoing`. First non-classic mode of the platform: a **close mode** (see [`../GAME-MODES.md`](../GAME-MODES.md)), i.e. classic chess with the changes below. Anything not mentioned here follows classic chess rules.

## 1. Setup

### 1.1 Kings in the corners
Each king starts in a corner of its own back rank instead of on the e-file.

- **To confirm:** which corner (a1/a8 or h1/h8)? Mirrored or point-symmetric between white and black?
- **To confirm:** what goes on the king's usual square (e1/e8), and where does the rook that used to stand in that corner go?

### 1.2 The "fou fou" (crazy bishop)
A new piece, the **fou fou**, starts on **h2** (white) and presumably **h7** (black).

- **To confirm:** how does it move and capture?
- **To confirm:** what happens to the h-pawn it replaces? Does it disappear, or move elsewhere?
- **To confirm:** can a pawn promote to a fou fou?

## 2. Castling
Castling **swaps the king and a rook**: each takes the other's square.

- **To confirm:** do the classic conditions still apply (neither piece has moved, no piece between them, king not in check, does not pass through or land on an attacked square)?
- **To confirm:** with the king in a corner, is castling possible with both rooks, or only one?

## 3. Pawns, rare pawns and hyperpawns

### 3.1 Vocabulary
- **Pawn**: the classic pawn.
- **Hyperpawn**: an upgraded pawn that can always move **1 or 2 squares** forward.
- **Rare pawn**: a pawn obtained by promotion (see 3.2).

### 3.2 Promotion
When a pawn reaches the last rank:

- it can promote as in classic chess, but **never into an opponent's piece**;
- it can also **promote into a pawn**. The result is a **rare pawn**.
- **To confirm:** what does "no opponent's piece" mean? (Classic promotion can't produce an enemy piece anyway. Is this about pieces that exist only on the opponent's side, or about piece types the opponent has lost?)
- **To confirm:** where does a rare pawn go? It is already on the last rank, so it cannot move forward. Does it go back to its starting rank? Does it change direction?

### 3.3 Hyperpawn
- A pawn can become a **hyperpawn**. A **rare pawn** can too.
- A hyperpawn moves **1 or 2 squares** forward on every move, not only its first one.
- **To confirm:** how and when does a pawn become a hyperpawn (a choice made on a move, a square reached, a cost)?
- **To confirm:** does it capture like a pawn? Can it jump over a piece on its 2-square move? Is it subject to en passant, and does it give en passant?

## 4. Game endings

### 4.1 New win conditions
- A **hyperpawn** reaching the last rank **wins the game** for its owner.
- A **rare pawn** reaching the last rank does **not** win.
- **To confirm:** "reaching the last rank": the opponent's back rank, or for a rare pawn, wherever its new goal is?

### 4.2 Threefold repetition
A threefold repetition is **not a draw**: the player who causes it **loses**.

- **To confirm:** is the loser the player whose move produces the third occurrence?
- **To confirm:** is it automatic, or must the opponent claim it?

### 4.3 Unchanged (to confirm)
Checkmate wins, stalemate is a draw, plus the fifty-move rule, insufficient material and resignation, all as in classic chess. **To confirm** that none of them change.

## 5. Implementation notes

- Not implementable with chess.js: new piece, new start position, new castling, new pawn kinds, new win conditions. This mode triggers the migration described in [`../GAME-MODES.md`](../GAME-MODES.md) (`Variant` → `GameMode`, in-house `src/engine/`).
- State must track each pawn's kind (pawn, rare pawn, hyperpawn) and the position history (for the repetition rule).
- UI needs: a fou fou piece, a visual distinction for rare pawns and hyperpawns, an extended promotion picker (pawn option), and a way to turn a pawn into a hyperpawn.
