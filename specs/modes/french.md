# French chess

> **Status: draft**, rules gathered with the uncle between 2026-10-29 and 2026-11-06 (see [`history/2026-11-06-french-chess.md`](../../history/2026-11-06-french-chess.md)). A few points are still open (section 9). Not implemented.

Mode id: `french`. Display name: **Échecs Français**. A **distant mode** (see [`../GAME-MODES.md`](../GAME-MODES.md)): **four games of chess played at once** on a single board of hexagons, where pieces can jump from one game to another. Anything not mentioned here follows classic chess rules: "do not change the classic rules without a reason".

The uncle's hand-drawn sketch: [`french-sketch.jpg`](french-sketch.jpg). Its eight colours were replaced by four hues (see 1.1). It has known errors: the board drawn violet/yellow has its colours inverted (see 1.3), and the crossed-out hexagons on the left edge, the "?" and the "~" marks are errata to ignore.

## 1. Board

### 1.1 Four boards, four hues
Four chessboards ("zones"), each with **one hue**: **red, blue, green, yellow**. On each board, light squares and dark squares are a light and a dark shade of that hue.

Two players, as in classic chess: **white** (at the bottom, moves first) and **black**. All the pieces of a player are white or black, whatever board they stand on: they **never take the colour of their board** (see 2).

Decided on 2026-11-24 after two mockups (see [`history/2026-11-24-french-chess-colours.md`](../../history/2026-11-24-french-chess-colours.md)). The uncle's sketch uses eight colours (white/black, blue/orange, green/red, violet/yellow, one colour per player and board); they map as white/black → red, blue/orange → blue, violet/yellow → green, green/red → yellow.

### 1.2 Geometry
The four boards are **interleaved** in one board of 256 hexagons (4 × 64): 16 rows of 16 hexagons, every other row shifted by half a hexagon. Hexagons are "pointy-top": each one touches its neighbours on the **left**, on the **right** and on the **four diagonals** (up-left, up-right, down-left, down-right). **No hexagon touches the one straight above or below it.**

- **Rows**: numbered 0 to 15 from white's side. Even rows hold the red and blue boards; odd rows hold the green and yellow boards, and are shifted half a hexagon to the right.
- **Inside a row**, the two boards of that row alternate: red on even columns and blue on odd columns in even rows, green on even columns and yellow on odd columns in odd rows.
- **Each board is a regular 8×8 chessboard**: hexagon `(row r, column c)` is on file `c ÷ 2` (a…h) and rank `r ÷ 2 + 1` (1…8), integer division. Its neighbouring files are 2 hexagons away on the same row, its neighbouring ranks 2 rows away. The two families of boards are therefore offset by one row: the bottom row holds rank 1 of red and blue, the top row holds rank 8 of green and yellow.
- **Neighbours**: every hexagon is surrounded by **the three other boards, each with its two shades**. Its left and right neighbours are the light and dark squares of the other board of its row; its four diagonal neighbours are the light and dark squares of the two boards of the other family. Hexagons on the edge of the board have fewer neighbours.

Useful coordinates for the implementation ("doubled" coordinates): `x = 2c + (r mod 2)`, `y = r`. The six hexagonal directions are then `(±2, 0)` and `(±1, ±1)`, and a straight line is a repeated direction.

### 1.3 Square colours
On every board, the **bottom-left square seen from white** (a1) is **dark**, as in classic chess, and h1 is light. The sketch gets this wrong for its violet/yellow board only.

### 1.4 Notation
The sketch labels ranks with the marks `` ` `` `:` `~` `/` and files with accented letters, one mark per board. Not needed for the rules; worth reusing for the move list later.

## 2. Setup and pieces

- Every board starts with the **classic start position**, white at the bottom (ranks 1–2) everywhere. Each player therefore has 4 kings, 4 queens, 8 rooks, 8 bishops, 8 knights and 32 pawns.
- A piece **always keeps its side**: a white knight that moves onto the green board is still a white knight. Showing which board a piece came from is left for a secondary view, later.
- **Pawns** always move in their side's direction: towards rank 8 for white, rank 1 for black.

## 3. Turn

White moves first. Players alternate, **one move per turn**, on the board of their choice. A move is either:

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
- **Start square**: a hexagonal move cannot start from the player's **first rank** (rank 1 for white, rank 8 for black) of the board the piece stands on. Any arrival hexagon is allowed, the first rank included.
- **Where it leads**: the arrival board depends on the direction and the distance. From a hexagon of the red board, for example:

  | Distance | Left or right | Diagonal |
  |---|---|---|
  | 1 | blue | green or yellow |
  | 2 | **red**, next file | blue |
  | 3 | blue | green or yellow |
  | 4 | **red**, 2 files away | **red**, 2 ranks and 1 file away |

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
- **Every piece on that board is removed**, both sides, including the pieces that came from other boards. Pieces that started on that board but stand on other boards stay.
- The board becomes a **forbidden zone**: no piece may stop on it any more, but hexagonal moves may **cross** it.
- The game goes on with the next turn as usual: the mated player moves.

"Do not mate with three queens in one zone": they disappear with the board.

## 7. Game endings

| Ending | Result |
|---|---|
| A player mates **twice** | that player wins |
| **Threefold repetition** of the whole position (all boards, side to move) | the player whose move produces the third occurrence **loses** (the uncle's "MVL" rule, as in Tourcoing chess) |
| **Stalemate**: the player to move has no legal move on any board | draw (the whole game), unless a player leads: then that player wins |
| **Insufficient material**, counted over all remaining boards: both players have only kings, or one has only kings and the other only kings and a single knight or a single bishop | draw (the whole game), unless a player leads: then that player wins |
| **Resignation** | the whole game is lost |

- **A draw ending while a player leads** (1–0) is **not a draw**: the leading player wins. Confirmed for stalemate; assumed for insufficient material too, to be confirmed.
- **No fifty-move rule.**
- Insufficient material is counted on the whole game, not per board, because a piece can always reach another board. The classic "bishops of the same colour" draw does not apply: a bishop can change square colour (see 4).
- The repetition and draw rules are detected and applied automatically, with no claim needed.

## 8. User interface

- **Default view**: the whole hexagonal board, with **zoom in / out**. Needs an in-house hexagonal renderer (react-chessboard only draws square boards).
- **Second view (later, separate ticket)**: the four boards side by side as four classic 8×8 boards in a square, with a way to switch between them. Hexagonal moves then need a way to pick the arrival board.
- **Colours**: four hues with a light and a dark shade, white and black pieces with a thin contrasting outline (see 1.1). Mockup palette: red `#f3c1b6` / `#c0452f`, blue `#bcd6f1` / `#2f6aae`, green `#c4e2b8` / `#3d8648`, yellow `#f5e3a3` / `#c4951a`.
- **Selection**: classic destinations get a dark dot (a ring for a capture, as on chess.com), hexagonal destinations a small white hexagon: two colours and two shapes. The other boards are dimmed, so the selected piece's board is easy to follow.
- Red and green are the hardest pair for colour-blind players: the light/dark shades and the dimming help, but check it before release.
- Score (mates per player) and forbidden zones must be visible at a glance.

## 9. Open questions

- **Insufficient material while leading**: does the leading player win, as with stalemate (assumed)?
- **Insufficient material**: the precise list above is our proposal, based on the uncle's "only a knight, only a bishop, or kings against kings"; to be confirmed.

## 10. Implementation notes

- Breaks the platform's "8x8 board for every mode" assumption ([`../GAME-MODES.md`](../GAME-MODES.md)): new board geometry, new coordinates, a `BoardView` that is not a single chessboard. The `GameMode` contract and the protocol stay mode-agnostic, but the view and the client rendering need a generalisation. A big pull request, to review carefully.
- The engine can model the game as **four logical 8×8 boards** plus a hexagonal adjacency map. Classic piece movement from `src/chess/` can then be reused per board; legality (check, mate, stalemate, the two-board check ban, hexagonal interpositions) is global and new.
- State: the four boards, the forbidden zones, the score, castling and en passant rights per board, the position history (for repetition).
