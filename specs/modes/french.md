# French chess

> **Status: draft**, rules gathered with the uncle between 2026-10-29 and 2026-11-06 (see [`history/2026-11-06-french-chess.md`](../../history/2026-11-06-french-chess.md)). A few points are still open (section 9). Not implemented.

Mode id: `french`. Display name: **Échecs Français**. A **distant mode** (see [`../GAME-MODES.md`](../GAME-MODES.md)): **four games of chess played at once** on a single board of hexagons, where pieces can jump from one game to another. Anything not mentioned here follows classic chess rules: "do not change the classic rules without a reason".

The uncle's hand-drawn sketch: [`french-sketch.jpg`](french-sketch.jpg). It has known errors: the yellow/violet board has its colours inverted (see 1.3), and the crossed-out hexagons on the left edge, the "?" and the "~" marks are errata to ignore.

## 1. Board

### 1.1 Four boards, eight colours
Four chessboards ("zones"), each with its own pair of colours. Each player owns one colour of every pair:

| Board | Cold player (moves first) | Warm player |
|---|---|---|
| White/black | white | black |
| Blue/orange | blue | orange |
| Green/red | green | red |
| Violet/yellow | violet | yellow |

The sketch draws red as pink. Pieces keep the colour of their **own side**, never of the board they stand on (see 2).

### 1.2 Geometry
The four boards are **interleaved** in one board of 256 hexagons (4 × 64): 16 rows of 16 hexagons, every other row shifted by half a hexagon. Hexagons are "pointy-top": each one touches its neighbours on the **left**, on the **right** and on the **four diagonals** (up-left, up-right, down-left, down-right). **No hexagon touches the one straight above or below it.**

- **Rows**: numbered 0 to 15 from the cold player's side. Even rows hold the white/black and blue/orange boards; odd rows hold the violet/yellow and green/red boards, and are shifted half a hexagon to the right.
- **Inside a row**, the two boards of that row alternate (white/black, blue/orange, white/black…).
- **Each board is a regular 8×8 chessboard**: hexagon `(row r, column c)` is on file `c ÷ 2` (a…h) and rank `r ÷ 2 + 1` (1…8), integer division. Its neighbouring files are 2 hexagons away on the same row, its neighbouring ranks 2 rows away. The two families of boards are therefore offset by one row: the bottom row holds rank 1 of white/black and blue/orange, the top row holds rank 8 of violet/yellow and green/red.
- **Neighbours**: every hexagon is surrounded by the **six other colours**, i.e. every colour except its own and its opponent's. Its left and right neighbours are both colours of the other board of its row; its four diagonal neighbours are the four colours of the two boards of the other family. Hexagons on the edge of the board have fewer neighbours.

Useful coordinates for the implementation ("doubled" coordinates): `x = 2c + (r mod 2)`, `y = r`. The six hexagonal directions are then `(±2, 0)` and `(±1, ±1)`, and a straight line is a repeated direction.

### 1.3 Square colours
On every board, the **bottom-left square seen from the cold player** (a1) has the **warm** colour, like the dark a1 square of classic chess. So: a1 is black, orange, red and yellow, and h1 is white, blue, green and violet. The sketch gets this wrong for violet/yellow only.

### 1.4 Notation
The sketch labels ranks with the marks `` ` `` `:` `~` `/` and files with accented letters, one mark per board. Not needed for the rules; worth reusing for the move list later.

## 2. Setup and pieces

- Every board starts with the **classic start position**, the cold player at the bottom (ranks 1–2) everywhere. Each player therefore has 4 kings, 4 queens, 8 rooks, 8 bishops, 8 knights and 32 pawns.
- A piece **always keeps its side and its colour**: a white knight that moves onto the green/red board is still a white knight, played by the cold player.
- **Pawns** always move in their side's direction: towards rank 8 for the cold player, rank 1 for the warm player.

## 3. Turn

The cold player moves first. Players alternate, **one move per turn**, on the board of their choice. A move is either:

- a **classic move**: classic chess on the board the piece stands on (captures, castling, en passant, promotion included);
- a **hexagonal move** (see 4).

Classic details unchanged: a rook or king that has moved, by any kind of move, can no longer castle; a pawn promotes on its board's last rank into a piece of its own side.

## 4. Hexagonal move

The main mechanic: the way a piece changes board.

- **Who**: knights, bishops, rooks and queens. **Never the king, never a pawn.**
- **How far**: in a **straight line**, along one of the **six hexagonal directions** (left, right, the four diagonals; never straight up or down), **up to**:

  | Piece | Range |
  |---|---|
  | knight, bishop | 3 hexagons |
  | rook | 5 hexagons |
  | queen | 9 hexagons |

- **Path**: every hexagon crossed and the arrival hexagon must be **empty**. A hexagonal move **never captures**. The hexagons of a mated board (see 6.2) count as empty for crossing, but the move cannot stop there.
- **Start square**: a hexagonal move cannot start from the player's **first rank** (rank 1 for the cold player, rank 8 for the warm player) of the board the piece stands on. Any arrival hexagon is allowed, the first rank included.
- **Where it leads**: the arrival board depends on the direction and the distance. From a white/black hexagon, for example:

  | Distance | Left or right | Diagonal |
  |---|---|---|
  | 1 | blue/orange | violet/yellow or green/red |
  | 2 | **white/black**, next file | blue/orange |
  | 3 | blue/orange | violet/yellow or green/red |
  | 4 | **white/black**, 2 files away | **white/black**, 2 ranks and 1 file away |

  A hexagonal move can therefore stay on the same board: a sideways step of 2 moves a piece by one file, which lets a bishop change square colour or a knight step sideways. This is intended.

- **Check**: a hexagonal move can give check, from its arrival square (see 5).

## 5. Check

- A piece attacks only with its **classic moves on the board it stands on**. Hexagonal moves never capture, so they never attack.
- As in classic chess, a move is illegal if it leaves **one of the player's own kings** in check.
- A check must **always be answered at once**, on the board where it is given. Interposing a piece that arrives by a hexagonal move is a valid answer.
- **Double check on a single board**: allowed.
- **Check on two boards with one move**: forbidden. Example: a hexagonal move that gives check on the arrival board and uncovers a discovered check on the departure board is illegal. A hexagonal move that parries a check on one board while uncovering a check on another gives only one check, so it is legal.

## 6. Checkmate

### 6.1 Definition
A king is checkmated when it is in check and **no move of its player, on any board**, answers the check (moving the king, capturing the attacker, interposing a piece, a hexagonal arrival included).

### 6.2 What happens
- The player who mates scores **1 point**.
- **Every piece on that board is removed**, both sides, including the pieces that came from other boards. Pieces of that board's colours standing on other boards stay.
- The board becomes a **forbidden zone**: no piece may stop on it any more, but hexagonal moves may **cross** it.
- The game goes on with the next turn as usual: the mated player moves.

"Do not mate with three queens in one zone": they disappear with the board.

## 7. Game endings

| Ending | Result |
|---|---|
| A player mates **twice** | that player wins |
| **Threefold repetition** of the whole position (all boards, side to move) | the player whose move produces the third occurrence **loses** (the uncle's "MVL" rule, as in Tourcoing chess) |
| **Stalemate**: the player to move has no legal move on any board | draw (the whole game) |
| **Insufficient material**, counted over all remaining boards: both players have only kings, or one has only kings and the other only kings and a single knight or a single bishop | draw (the whole game) |
| **Resignation** | the whole game is lost |

- **No fifty-move rule.**
- Insufficient material is counted on the whole game, not per board, because a piece can always reach another board. The classic "bishops of the same colour" draw does not apply: a bishop can change square colour (see 4).
- The repetition and draw rules are detected and applied automatically, with no claim needed.

## 8. User interface

- **Default view**: the whole hexagonal board, with **zoom in / out**. Needs an in-house hexagonal renderer (react-chessboard only draws square boards).
- **Second view (later, separate ticket)**: the four boards side by side as four classic 8×8 boards in a square, with a way to switch between them. Hexagonal moves then need a way to pick the arrival board.
- Readability: 8 square colours and 8 piece colours. Do not rely on colour alone (red/green is the hardest pair for colour-blind players), and make the selected piece's board easy to follow, e.g. by dimming the other boards.
- Score (mates per player) and forbidden zones must be visible at a glance.

## 9. Open questions

- **Draw while leading**: if a draw ending (stalemate, insufficient material) happens while a player leads 1–0, is it still a draw?
- **Insufficient material**: the precise list above is our proposal, based on the uncle's "only a knight, only a bishop, or kings against kings"; to be confirmed.
- **Home screen**: what happens to the classic mode in the new order (see [`../UI.md`](../UI.md))?

## 10. Implementation notes

- Breaks the platform's "8x8 board for every mode" assumption ([`../GAME-MODES.md`](../GAME-MODES.md)): new board geometry, new coordinates, a `BoardView` that is not a single chessboard. The `GameMode` contract and the protocol stay mode-agnostic, but the view and the client rendering need a generalisation. A big pull request, to review carefully.
- The engine can model the game as **four logical 8×8 boards** plus a hexagonal adjacency map. Classic piece movement from `src/chess/` can then be reused per board; legality (check, mate, stalemate, the two-board check ban, hexagonal interpositions) is global and new.
- State: the four boards, the forbidden zones, the score, castling and en passant rights per board, the position history (for repetition).
