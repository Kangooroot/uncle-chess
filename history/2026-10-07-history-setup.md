# 2026-10-07 — Ideation history setup

## Context
Start of the uncle-chess project (chess variants invented by Rémi's uncle). `specs/MAIN.md` was empty.

## Decisions
- Created the `history/` directory: one new markdown file per notable topic discussed, to keep track of ideation throughout the project.
- This rule is written in `specs/MAIN.md`.
- `CLAUDE.md` imports `specs/MAIN.md` (`@specs/MAIN.md`) so it is loaded in every session.

## Points of attention
- The variant rules have not been described yet.
