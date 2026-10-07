# Game modes

uncle-chess is not a single game but a **platform of game modes** built around the chessboard. Some modes are very close to classic chess. Others only keep the 8x8 board and multiplayer.

Idea recorded on 2026-10-07 (see [`history/2026-10-07-game-modes.md`](../history/2026-10-07-game-modes.md)).

## Vocabulary

- **Game mode** (`GameMode`): a complete, playable game (e.g. "classic", a mode invented by my uncle). This term replaces "variant".
- **Building block**: a piece of rules or UI reusable across modes (e.g. knight movement, check detection).
- **Action**: what a player sends on their turn. Usually a move `{ from, to }`, but a mode can define its own (drop a piece, pick a square…).

## Shared by all modes

These are fixed and never change from one mode to another:

- an **8x8 board** (squares `a1` … `h8`);
- **two players** (white `w` / black `b`), 1v1;
- **multiplayer**: game by link, server room, side assignment, reconnection, spectators;
- an **authoritative server**: every action goes through the mode's rules before being accepted.

## Reusable building blocks

A mode picks the blocks it needs, and can replace or add some. Target blocks:

| Family | Examples |
|---|---|
| Board | coordinates, directions, neighbouring squares, ranks and files |
| Pieces | movement of each classic piece: sliding (rook, bishop, queen), jumping (knight), stepping (king), pawn |
| Legality | "the king must not be left in check", check detection |
| Special moves | castling, en passant, promotion |
| Game endings | checkmate, stalemate, repetition, fifty-move rule, insufficient material, resignation, (later) time |
| UI | board rendering, custom pieces, legal move highlighting, promotion picker |

Examples of combinations:
- **Classic**: every block.
- **Close mode**: the classic blocks, one of them modified or extended (e.g. a piece that moves differently, an extra win condition).
- **Distant mode**: only the board and multiplayer, with its own pieces, actions and win conditions.

## Game mode contract (target)

Each mode is an object of **pure functions**. Its state must be **JSON-serializable**, since it is stored in the Durable Object and sent to clients.

```ts
interface GameMode<State, Action> {
  id: string;            // stable identifier, used in URLs and storage
  name: string;          // display name
  description: string;   // rules summary for the mode picker

  setup(): State;                                                  // initial state
  play(state: State, action: Action, player: Color): State | null; // null = illegal action
  toPlay(state: State): Color | null;                              // who must play (null = game over)
  status(state: State): Status;                                    // ongoing, win (and how), draw
  view(state: State, viewer: Color | "spectator"): BoardView;      // what the UI displays
}
```

- `view` receives **who is looking**. This enables hidden-information modes later (e.g. fog of war): the server will then send each player only their own view.
- `BoardView` is generic: the piece on each square (type and side, possibly a brand-new piece), plus annotations (highlighted squares, arrows…).
- The **server and protocol know nothing about modes**. They carry actions and views without interpreting them.
- By default, the UI turns a drag & drop into a `{ from, to }` action. A mode that needs other interactions provides its own UI component.

## Code layout (target)

```
src/engine/          reusable building blocks (board, pieces, legality, special moves, endings)
src/modes/index.ts   registry of available modes
src/modes/<id>/      one folder per mode: rules, tests, and UI if needed
specs/modes/<id>.md  human-readable rules of the mode
```

Each mode has **tests** describing its specific rules. Its rules are written in `specs/modes/<id>.md` before or during implementation.

## Current state and migration

- The current code (`src/rules/`, `Variant` interface) only contains the classic mode, fully delegated to chess.js.
- chess.js is monolithic: we cannot extract building blocks from it or change a rule. The building-block engine (`src/engine/`) will therefore be written in-house. chess.js stays useful in tests, to check that our classic mode generates exactly the same moves.
- Migration planned when the first non-classic mode is added: `Variant` → `GameMode`, `src/rules/` → `src/engine/` + `src/modes/`, and a generic protocol (actions and views instead of FEN and moves).

## Open questions

- Are all modes turn-based, or can some be simultaneous?
- Is the mode chosen only when the game is created (proposal: yes, stored in the room)?
- Should a mode be configurable (e.g. toggleable options), or is every combination a separate mode?
