// 8x8 board geometry. Internally a square is an index 0…63 (rank * 8 + file,
// a1 = 0); square names ("e4") are used at the API boundary.

import type { Dir, Square } from "./types";

/** File and rank delta of each direction. */
export const DIRS: Record<Dir, readonly [number, number]> = {
  n: [0, 1],
  s: [0, -1],
  e: [1, 0],
  w: [-1, 0],
  ne: [1, 1],
  nw: [-1, 1],
  se: [1, -1],
  sw: [-1, -1],
};

const FILES = "abcdefgh";

export function isSquare(value: unknown): value is Square {
  return typeof value === "string" && /^[a-h][1-8]$/.test(value);
}

export function toIndex(square: Square): number {
  return (Number(square[1]) - 1) * 8 + FILES.indexOf(square[0]);
}

export function toSquare(index: number): Square {
  return FILES[index % 8] + (Math.floor(index / 8) + 1);
}

export function fileOf(index: number): number {
  return index % 8;
}

export function rankOf(index: number): number {
  return Math.floor(index / 8);
}

/** The square `df` files and `dr` ranks away, or `null` off the board. */
export function offset(index: number, df: number, dr: number): number | null {
  const file = fileOf(index) + df;
  const rank = rankOf(index) + dr;
  return file >= 0 && file < 8 && rank >= 0 && rank < 8 ? rank * 8 + file : null;
}

/** The neighbouring square in direction `dir`, or `null` off the board. */
export function step(index: number, dir: Dir): number | null {
  return offset(index, ...DIRS[dir]);
}
