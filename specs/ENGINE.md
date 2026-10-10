# Engine architecture

> **Status: implemented** for classic chess (PR 1, `refactor/chess-engine`) and Tourcoing (PR 2, `feat/tourcoing-mode`, see [`history/2026-10-10-tourcoing-implementation.md`](../history/2026-10-10-tourcoing-implementation.md)). See [`history/2026-10-09-chess-engine-design.md`](../history/2026-10-09-chess-engine-design.md) and [`history/2026-10-09-chess-engine-implementation.md`](../history/2026-10-09-chess-engine-implementation.md).

How game modes are built: a mode-agnostic **core**, a reusable **chess family** layer, and the **modes** on top. This replaces the single `src/engine/` target of [`GAME-MODES.md`](GAME-MODES.md) and the current `src/rules/` (chess.js).

## 1. Layers

```
src/core/            shared by ALL games: GameMode contract, Color, Square, Seat,
                     Status, BoardView, 8x8 geometry (coordinates, directions)
       ▲
src/chess/           the chess family: state, pieces, move generation, legality,
                     castling, en passant, promotion, endings, presets
                     → exposes createChessMode(meta, rules) and classicRules
       ▲
src/modes/classic/   createChessMode(..., classicRules)
src/modes/tourcoing/ createChessMode(..., { ...classicRules, overrides })
src/modes/<other>/   a non-chess game implements GameMode directly, using only src/core/
src/modes/index.ts   registry: id → GameMode
```

Rules:

- **Dependencies only point up.** `core` knows nothing about chess, `chess` knows no mode, a mode never imports another mode.
- **Nothing mode-specific in `src/chess/`.** When a mode needs to change a behaviour, `chess` exposes a **generic extension point** and the mode provides the implementation. Extension points are added on demand, never speculatively.
- **State is plain JSON, behaviour is plain objects.** No classes in the state (it is stored in the Durable Object and sent over WebSocket). Behaviours are objects of functions, composed with spread (`{ ...pawn, ... }`).
- Everything stays pure (no DOM, no Cloudflare APIs): it runs identically in the browser and in the Worker.

## 2. Core (`src/core/`)

```ts
type Color = "w" | "b";
type Square = string;                      // "a1" … "h8"
type Dir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
type Seat = Color | "both" | "spectator";  // "both": solo play, development only

type Status =
  | { kind: "playing" }
  | { kind: "win"; winner: Color; reason: string }  // "checkmate", "rare-pawn", "repetition"…
  | { kind: "draw"; reason: string };               // "stalemate", "repetition", "fifty-moves", "material"…

interface GameMode<State, Action> {
  id: string;
  name: string;
  description: string;
  reasons: Record<string, string>;  // display text of each Status reason, e.g. { checkmate: "Checkmate" }

  setup(): State;
  play(state: State, action: Action, player: Color): State | null;  // null = illegal
  toPlay(state: State): Color | null;                                // null = game over
  status(state: State): Status;
  view(state: State, viewer: Seat): BoardView;
}

type BoardView = {
  pieces: Partial<Record<Square, ViewPiece>>;
  turn: Color | null;
  lastMove: { from: Square; to: Square } | null;
  check: Square[];                 // royal pieces in check, highlighted by the UI
  moves: Partial<Record<Square, Square[]>>;  // legal destinations of each piece of the side to move (move hints)
};

type ViewPiece = {
  color: Color;
  kind: string;                    // "k", "q", "r", "b", "n", "p", or a mode's own kind ("rare-pawn")
  dir?: Dir;                       // pawn-like pieces: which way they move
};
```

Board geometry (`src/core/board.ts`): helpers to convert squares ⇄ coordinates, step in a direction, and test whether a square is on the board. Internally, a square is an index `0…63` (`rank * 8 + file`, `a1 = 0`); square names are used at the API boundary.

Changes to the contract of [`GAME-MODES.md`](GAME-MODES.md): `Status` gets a generic `reason` (modes add their own win and draw reasons), `reasons` gives their display text, and `view` takes a `Seat` (solo play adds `"both"`).

`play` receives **untrusted input** (it comes from the network): it must reject any malformed action, not only illegal ones.

## 3. Chess family (`src/chess/`)

### 3.1 State

```ts
type Piece = {
  type: string;        // key in rules.pieces: "k", "q", "r", "b", "n", "p", or a mode's own type
  color: Color;
  moved: boolean;      // castling rights (king, rook) and pawn two-square move
  dir?: Dir;           // pawn-like pieces only
};

type ChessState = {
  board: (Piece | null)[];   // 64 squares, index = rank * 8 + file
  turn: Color;
  enPassant: { target: Square; pawn: Square } | null;  // skipped square, and the pawn to capture
  halfmoves: number;         // since the last capture or pawn move (fifty-move rule)
  history: string[];         // position keys since the last irreversible move, current one included (repetition)
  lastMove: { from: Square; to: Square } | null;
  status: Status;            // computed once per move by the ending rules
};

type ChessAction = { from: Square; to: Square; promotion?: string };
```

Design choices:

- **`moved` replaces the castling rights and the "second rank" test.** A pawn can make a two-square move while `moved` is false. A mode that promotes a pawn into a fresh one (Tourcoing's rare pawn) just sets `moved: false` again.
- **Each pawn carries its direction** (`dir`). The classic preset gives `n` to white pawns and `s` to black pawns; Tourcoing gives `e` and `s`. Pawn rules (one or two steps, diagonal captures, en passant, promotion on the board edge) are written once, relative to `dir`.
- **En passant stores both squares**: with perpendicular pawns, the captured pawn is not always "behind" the target square.
- **The status is stored**, computed by the ending rules right after each move. Some endings depend on the move just played (repetition: who produced the third occurrence).
- **Position key** (repetition): every piece's type, colour and direction, the side to move, the castling rights (`CastlingRule.rights`), and the en passant target only when a legal move can take it. `moved` is left out on purpose: with it, a knight going back and forth would never repeat the start position. `history` is cleared after a capture or a pawn move (a piece with a `dir`), since no earlier position can come back.

### 3.2 Rules: the extension points

```ts
interface ChessRules {
  setup: Preset;                       // start position (data)
  pieces: Record<string, PieceKind>;   // behaviour of each piece type
  castling: CastlingRule | null;
  promotion: PromotionRule;
  endings: EndingRule[];               // checked in order after each move; the first match wins
}

// Inside src/chess/, squares are indices 0…63.
interface PieceKind {
  royal?: boolean;                                     // must not be left in check (the king)
  moves(state: ChessState, from: number): ChessMove[]; // pseudo-legal moves, captures included (state: en passant)
  attacks(board: Board, from: number): number[];       // squares it attacks (check, castling)
}

interface PromotionRule {
  // Pieces a moving piece can turn into on `to`, the first one being the default. null = no promotion.
  options(piece: Piece, to: number): Piece[] | null;
}

interface CastlingRule {
  rights(board: Board, king: number): number[];  // partners that king can still castle with some day (position key)
  moves(state: ChessState, king: number, attacked: (square: number, by: Color) => boolean): ChessMove[];
}

type EndingContext = { legalMoves: ChessMove[]; inCheck: boolean };  // of the side to move
type EndingRule = (state: ChessState, context: EndingContext) => Status | null;

type Preset = { placement: string; pawnDirs: Record<Color, Dir>; turn: Color };  // FEN-like placement
```

`ChessMove` is the internal, richer form of a move: `from`, `to`, the captured square (en passant), the rook move (castling), the en passant target it creates, the promoted piece. `EndingContext` gives ending rules what they need besides the state (which holds the history).

Building blocks provided by `src/chess/`, and what `classicRules` uses:

| Extension point | Generic blocks | `classicRules` |
|---|---|---|
| `setup` | FEN placement parser, pawn directions | standard position, pawns `n` / `s` |
| `pieces` | `slider(dirs)`, `leaper(offsets)`, `king`, `pawn` | k, q, r, b, n, p |
| `castling` | `standardCastling` (king two squares, rook jumps over); `swapCastling` (king ↔ rook of its rank or file) | `standardCastling` |
| `promotion` | `promoteTo(types)`, on the edge of the pawn's direction | queen (default), rook, bishop, knight |
| `endings` | `checkmate`, `stalemate`, `repetition(outcome)`, `fiftyMoves`, `insufficientMaterial` | all, repetition = draw |

### 3.3 Generic algorithm

- **Legal moves** = pseudo-legal moves of every piece of the side to move, plus castling moves, keeping only those after which no royal piece of that side is attacked.
- **`play`**: validate the action's shape, find the legal move matching `from`, `to` and `promotion` (no `promotion` = the default option), apply it, update `enPassant`, `halfmoves`, `history`, `lastMove`, then run `endings` to set `status`.
- **Classic UI promotion** (auto queen, decision B): the UI sends `{ from, to }` and the rule's default option applies. The pawn/last-rank test in `Game.tsx` disappears.

### 3.4 `createChessMode`

```ts
function createChessMode(meta: { id: string; name: string; description: string }, rules: ChessRules): GameMode<ChessState, ChessAction>;
```

Builds the whole `GameMode` from the rules, including `view` (pieces, check highlight, last move, legal destinations) and the display text of the standard reasons (`STANDARD_REASONS`). A mode adds the text of its own reasons with spread (`{ ...mode, reasons: { ...STANDARD_REASONS, ... } }`), and can still wrap a function of the result for a need no extension point covers.

Files: `types.ts` (state and extension points), `engine.ts` (generic algorithm), `pieces.ts`, `castling.ts`, `promotion.ts`, `endings.ts` (building blocks), `classic.ts` (`classicRules`), `mode.ts` (`createChessMode`).

## 4. Protocol, server, client

```ts
type GameState = { mode: string; state: unknown; players: Record<Color, string | null> };
type ClientMessage = { type: "action"; action: unknown };
```

- The server stores `{ version: 2, mode, state, tokens, names }` in the Durable Object and broadcasts the mode's state. Rooms with an older stored format start a new game (decision A).
- The server and the protocol do not interpret `state` or `action`: they go through the mode (`play`, `toPlay`).
- The client computes `view(state, seat)` itself, and runs `play` for the optimistic display. A hidden-information mode will later need the server to send views instead of the state (open point, not needed now).
- The board UI renders a `BoardView`. It maps each `ViewPiece` to a react-chessboard piece; a mode can draw pieces its own way with a `ModeUI` (`src/modes/<id>/ui.tsx`, registered in `src/modes/ui.ts`). These files are client-only: the Worker's `tsconfig` excludes them and never imports them.
- The mode is chosen when the game is created and fixed in the room (decision C): the creator's URL carries `?mode=<id>`, and only the first connection to a new room uses it (unknown ids fall back to `classic`).

## 5. Tests

- **`src/chess/`, against chess.js** (dev dependency only), with `classicRules`:
  - perft (number of move sequences at depth N) from the start position and from the standard tricky positions (castling, en passant, promotion, pins), compared with chess.js's `perft`;
  - random games: at every position, same legal moves and same status as chess.js.
- **Each building block** with small targeted positions: perpendicular pawns, en passant between them, `repetition("loses")` (swap castling with Tourcoing).
- **Each mode** has a test file following its spec (`specs/modes/<id>.md`).

## 6. Delivery

**PR 1, `refactor/chess-engine`**: classic chess on the new engine, no visible change for players.

1. `src/core/`: types and geometry.
2. `src/chess/`: state, pieces, legality, castling, en passant, promotion, endings, presets, `createChessMode`, `classicRules`. Tests against chess.js.
3. `src/modes/`: registry and `classic`.
4. Protocol, server (storage version 2), client (generic board view, statuses from `reasons`). Solo play kept.
5. Remove `src/rules/`, chess.js becomes a dev dependency, update `tsconfig` includes and the specs.

Big PR (protocol, storage, contract): warn and point to the parts to review closely.

**PR 2, `feat/tourcoing-mode`**: preset, rare pawn kind, promotion into a rare pawn, `swapCastling`, ending rules (rare pawn goal, repetition loses), mode picker on game creation, rare pawn rendering and pawn direction display. Tests following [`modes/tourcoing.md`](modes/tourcoing.md).
