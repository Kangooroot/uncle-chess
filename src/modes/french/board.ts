// French chess geometry: four 8x8 boards interleaved in 16 rows of 16
// pointy-top hexagons. Rules in specs/modes/french.md (section 1.2).
//
// A cell is a square of one board. Internally it is an index 0…255
// (`board * 64 + square`, square = rank * 8 + file as in src/core); its name
// ("red:e4") is used at the API boundary. On the hexagonal grid it sits at
// row 0…15 (from white's side) and column 0…15.

import { isSquare, toIndex, toSquare } from "../../core";

export const BOARDS = ["red", "blue", "green", "yellow"] as const;
export type BoardId = (typeof BOARDS)[number];
export type Cell = string; // "red:e4"

export const CELLS = 256;
const SIZE = 16;

export const boardOf = (cell: number) => cell >> 6;
export const squareOf = (cell: number) => cell & 63;
export const cellOf = (board: number, square: number) => board * 64 + square;

export function isCell(value: unknown): value is Cell {
  if (typeof value !== "string") return false;
  const [board, square, ...rest] = value.split(":");
  return rest.length === 0 && (BOARDS as readonly string[]).includes(board) && isSquare(square);
}

export function toCellIndex(cell: Cell): number {
  const [board, square] = cell.split(":");
  return cellOf(BOARDS.indexOf(board as BoardId), toIndex(square));
}

export function toCell(index: number): Cell {
  return `${BOARDS[boardOf(index)]}:${toSquare(squareOf(index))}`;
}

/**
 * Position on the hexagonal grid. Even rows hold red (even columns) and blue
 * (odd columns), odd rows green and yellow; odd rows are shifted half a
 * hexagon to the right. A board's file f and rank r sit at column 2f and row
 * 2r, plus the board's own offset.
 */
export function hexOf(cell: number): { row: number; col: number } {
  const board = boardOf(cell);
  const square = squareOf(cell);
  return { row: 2 * (square >> 3) + (board >> 1), col: 2 * (square & 7) + (board & 1) };
}

/** The cell at that row and column, or `null` off the grid. */
export function cellAt(row: number, col: number): number | null {
  if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return null;
  const board = (row & 1) * 2 + (col & 1);
  return cellOf(board, (row >> 1) * 8 + (col >> 1));
}

/**
 * The six hexagonal directions in "doubled" coordinates (x = 2 × col + row
 * parity, y = row): right, left and the four diagonals. Never straight up or
 * down: those hexagons do not touch.
 */
export const HEX_DIRS: readonly (readonly [number, number])[] = [
  [2, 0],
  [-2, 0],
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
];

/** The cells along a straight hexagonal line from `cell`, nearest first, up to `range` steps. */
export function hexLine(cell: number, [dx, dy]: readonly [number, number], range: number): number[] {
  const { row, col } = hexOf(cell);
  const x = 2 * col + (row & 1);
  const cells: number[] = [];
  for (let i = 1; i <= range; i++) {
    const y = row + dy * i;
    const c = (x + dx * i - (y & 1)) / 2;
    const next = cellAt(y, c);
    if (next === null) break;
    cells.push(next);
  }
  return cells;
}

/** The hexagons touching `cell`. */
export function neighbours(cell: number): number[] {
  return HEX_DIRS.flatMap((dir) => hexLine(cell, dir, 1));
}
