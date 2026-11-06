# French chess: rules gathered with the uncle

A new mode asked by the user on 2026-10-29: **Échecs Français**, four games of chess played at once on one hexagonal board. Rules gathered over several rounds of questions to the uncle (2026-10-29 to 2026-11-06), plus a photo of his hand-drawn board ([`specs/modes/french-sketch.jpg`](../specs/modes/french-sketch.jpg)). The spec is [`specs/modes/french.md`](../specs/modes/french.md).

## Decided
- **Four boards, eight colours**: white/black, blue/orange, green/red, violet/yellow. The cold player (white, blue, green, violet) moves first; the warm player has black, orange, red, yellow.
- **Geometry**: the four 8×8 boards are interleaved in 16 rows of 16 pointy-top hexagons. Every hexagon is surrounded by the six colours other than its own and its opponent's. Checked with a small script: the uncle's layout has this property, and each board is a regular checkerboard inside it. a1 is the warm colour on every board (the sketch inverts violet/yellow).
- **Pieces keep their side and colour** whatever board they stand on. Pawns keep their side's direction.
- **One move per turn**, on the board of one's choice.
- **Hexagonal move**: knights, bishops, rooks and queens (not kings, not pawns) slide in a straight line along one of the six hexagonal directions (left, right, four diagonals; never straight up or down), up to 3 / 5 / 9 hexagons (minor pieces / rook / queen, the classic piece values). Path and arrival must be empty, no capture. It may stay on the same board (2 sideways). Cannot start from the player's first rank; any arrival is allowed.
- **Check**: must always be answered at once, a hexagonal interposition included. Double check on one board is allowed; check on two boards with one move is forbidden.
- **Mate**: no move on any board answers the check. The mater scores 1; every piece on that board is removed; the board becomes a forbidden zone that can be crossed but not stopped on. The mated player moves next, as usual.
- **Endings**: first to two mates wins; threefold repetition loses for the player who produces it (the uncle's "MVL" rule, as in Tourcoing chess); stalemate (no move anywhere) and insufficient material (counted over the whole game) draw the whole game; resignation ends the whole game; no fifty-move rule.
- **A draw ending while a player leads 1–0**: the leading player wins. Said for stalemate; assumed for insufficient material.
- **Home screen order**: Tourcoing chess, French chess, classic chess, then the modes to come.
- **UI**: default view is the hexagonal board with zoom. A second view with the four boards side by side comes in a separate ticket.

## Changed along the way
- Early ideas dropped by the uncle: no hexagonal move to or from ranks 1 and 8 (now: only the start from the player's first rank is forbidden); hexagonal moves only to an adjacent hexagon (now: up to 3 / 5 / 9); half points per board and a 2–2 tie (now: a single game, first to two mates); the fifty-move rule (removed to avoid contradicting "stalemate is the only draw", then insufficient material was added back as a draw).
- A "vertical" hexagonal move was briefly mentioned, then withdrawn: hexagons do not touch straight up or down.

## Open questions
- Does the leading player also win on insufficient material (assumed)?
- Exact insufficient material list (our proposal in the spec).

## Points of attention
- Breaks the "8x8 board for every mode" assumption: new geometry and a non-square `BoardView`, an in-house hexagonal renderer. Big pull request when implemented.
- Readability: 8 colours, colour-blind players (red/green), dim the other boards around a selected piece.
