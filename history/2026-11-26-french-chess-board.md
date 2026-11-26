# French chess board: playable

Date: 2026-11-26. Step 2 of the plan in [2026-11-26-french-chess-client](2026-11-26-french-chess-client.md).

## What was done

- **Hexagonal board** (`src/modes/french/ui.tsx`): the 256 hexagons in SVG, with the four-hue palette of the chosen mockup ([2026-11-24-french-chess-colours](2026-11-24-french-chess-colours.md)). Hexagons are drawn at full size, so a click never falls between two of them; the stroke draws the gaps.
- **Pieces**: react-chessboard's drawings, nested in the SVG, so every mode has the same pieces. Black pieces get a thin light halo for the dark shades (dark blue, dark red).
- **Moves**: click a piece, then a destination. Dots and rings for classic moves, small white hexagons for hexagonal moves, the other boards dimmed (as in the mockup).
- **Marks**: last move outlined, check in red with a white outline, selection in yellow with a dark shadow. The outlines were added after checking a red king in check and a selection on the yellow board: without them, both disappeared on their own hue.
- **Score and forbidden boards**: a line above the board ("Mats · Blancs 1 · Noirs 0 · Zone interdite : échiquier vert"); forbidden hexagons faded and hatched.
- **Black's view**: the board turned around (point reflection of the grid, which keeps its outline).
- **Home**: the mode is registered, in the order Tourcoing, French, classic; its card shows a hexagonal preview in a square box, so the cards stay aligned.
- **Layout** (`layout.ts`): pure geometry, tested (neighbours one hexagon apart, board inside its box, turned around for black).

## Checked

- A two-player game in Chromium: classic move, hexagonal move, black's turned view.
- A crafted position (check, forbidden board, score) rendered to HTML.
- A phone (iPhone 13) in dark mode: no horizontal scroll, but hexagons are about 20 px wide: usable, small. Zoom comes next.
- State size: about 20 kB at most over a 400-ply random game (the repetition history restarts at every capture or pawn move), well under the Durable Object storage limits.

## Left for step 3

- Zoom (wheel, +/−, pinch), panning, dragging pieces (a drag that starts on a piece moves it, any other drag pans).
- The rules modal, for every mode.
- A colour-blindness check of red and green.
- No keyboard play on this board (the 8x8 board has none either).
