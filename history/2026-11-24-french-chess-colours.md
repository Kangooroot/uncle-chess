# French chess: four hues, white and black pieces

Follows [`2026-11-06-french-chess.md`](2026-11-06-french-chess.md). Two interactive mockups of the hexagonal board were made as standalone pages (not in the repository): one with the uncle's eight colours, one with four hues.

## Decided
- **Four hues, one per board**: red, blue, green, yellow, each with a light and a dark shade for the light and dark squares. a1 is dark on every board. The eight-colour version looked like a harlequin.
- **White and black pieces**: all of the bottom player's pieces are white, all of the opponent's black, whatever board they stand on. "Cold" and "warm" players become white and black in the spec.
- Mapping from the sketch: white/black → red, blue/orange → blue, violet/yellow → green, green/red → yellow.
- Mockup interactions kept for the real UI: classic destinations as a dark dot (ring for a capture), hexagonal destinations as a small white hexagon, other boards dimmed when a piece is selected, zoom with the wheel, buttons and pinch, a "Règles" button on the board's edge opening a modal.

## Left for later
- Showing which board a piece came from, in a secondary view.
- Checking the red and green boards with colour-blind players.
