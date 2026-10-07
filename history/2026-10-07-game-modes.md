# 2026-10-07 — Multiple game modes, reusable building blocks

## Context
After the stack setup (see [`2026-10-07-stack-choice.md`](2026-10-07-stack-choice.md)), Rémi clarified his vision: the project is not a single variant but **several game modes**.

## Idea
- All modes share some basic chess rules, and each has its own specifics.
- Some modes may be completely different from the base game and only keep the **8x8 board** and **multiplayer**.
- We want **building blocks** reusable from one mode to another.

## Proposed (detailed in [`specs/GAME-MODES.md`](../specs/GAME-MODES.md))
- The term "game mode" (`GameMode`) replaces "variant".
- Fixed foundation: 8x8 board, 1v1, multiplayer by link, authoritative server.
- Building blocks: board, piece movement, legality/check, special moves, game endings, UI.
- Mode contract made of pure functions, JSON-serializable state. `view(state, viewer)` depends on who is looking, to allow hidden information later.
- Server and protocol are mode-agnostic.
- Target layout: `src/engine/` (building blocks), `src/modes/<id>/`, `specs/modes/<id>.md`.

## Points of attention
- chess.js is monolithic: the building-block engine will be written in-house. chess.js stays as a reference in the classic mode tests.
- The code migration (`Variant` → `GameMode`, generic protocol) is not done. It is planned for when the first non-classic mode is added.
- Open questions: turn-based only? Mode chosen at creation only? Configurable modes, or one combination = one mode?
