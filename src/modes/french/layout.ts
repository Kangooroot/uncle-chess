// Where the hexagons of the French chess board are drawn, in SVG units.
// Pure geometry, kept apart from the React drawing (ui.tsx) to be tested.

import { hexOf } from "./board";

/** Circumradius of a pointy-top hexagon. */
export const R = 20;
/** Width of a hexagon, and distance between two neighbours. */
export const W = Math.sqrt(3) * R;
const PAD = 2;
const SIZE = 16;

/** The whole board: 16 rows of 16 hexagons, odd rows shifted by half a hexagon. */
export const WORLD = { width: 2 * PAD + (SIZE + 0.5) * W, height: 2 * PAD + 2 * R + (SIZE - 1) * 1.5 * R };

export type Point = { x: number; y: number };

/** Centre of a cell's hexagon, white's first row at the bottom. `flipped` turns the board around for black. */
export function hexCenter(cell: number, flipped: boolean): Point {
  const { row, col } = hexOf(cell);
  const x = PAD + W / 2 + ((2 * col + (row & 1)) * W) / 2;
  const y = PAD + R + (SIZE - 1 - row) * 1.5 * R;
  return flipped ? { x: WORLD.width - x, y: WORLD.height - y } : { x, y };
}

/** SVG points of a pointy-top hexagon. */
export function hexPoints({ x, y }: Point, radius: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 90);
    return `${(x + radius * Math.cos(angle)).toFixed(2)},${(y + radius * Math.sin(angle)).toFixed(2)}`;
  }).join(" ");
}
