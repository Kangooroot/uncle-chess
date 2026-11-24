import { describe, expect, it } from "vitest";
import {
  boardOf,
  cellAt,
  CELLS,
  HEX_DIRS,
  hexLine,
  hexOf,
  isCell,
  neighbours,
  squareOf,
  toCell,
  toCellIndex,
} from "./board";

const line = (from: string, dir: number, range: number) => hexLine(toCellIndex(from), HEX_DIRS[dir], range).map(toCell);
const shade = (cell: number) => ((squareOf(cell) & 7) + (squareOf(cell) >> 3)) % 2; // 0: dark (a1), 1: light

describe("french board", () => {
  it("names cells by board and square", () => {
    expect(toCell(toCellIndex("green:e4"))).toBe("green:e4");
    expect(isCell("yellow:h8")).toBe(true);
    for (const bad of ["purple:e4", "red:e9", "red", "red:e4:x", 42, null]) expect(isCell(bad)).toBe(false);
  });

  it("places each of the 256 cells on its own hexagon of the 16 × 16 grid", () => {
    const seen = new Set<string>();
    for (let cell = 0; cell < CELLS; cell++) {
      const { row, col } = hexOf(cell);
      expect(cellAt(row, col)).toBe(cell);
      seen.add(`${row},${col}`);
    }
    expect(seen.size).toBe(256);
    expect(hexOf(toCellIndex("red:a1"))).toEqual({ row: 0, col: 0 });
    expect(hexOf(toCellIndex("blue:a1"))).toEqual({ row: 0, col: 1 });
    expect(hexOf(toCellIndex("green:a1"))).toEqual({ row: 1, col: 0 });
    expect(hexOf(toCellIndex("yellow:h8"))).toEqual({ row: 15, col: 15 });
    expect(cellAt(16, 0)).toBeNull();
  });

  it("surrounds every inner hexagon with both shades of the three other boards", () => {
    for (let cell = 0; cell < CELLS; cell++) {
      const around = neighbours(cell);
      if (around.length < 6) continue; // edge of the grid
      for (let board = 0; board < 4; board++) {
        const shades = around.filter((n) => boardOf(n) === board).map(shade);
        const perShade = [0, 1].map((s) => shades.filter((x) => x === s).length);
        expect(perShade).toEqual(board === boardOf(cell) ? [0, 0] : [1, 1]);
      }
    }
  });

  it("leads where the spec's table says, from a red hexagon", () => {
    expect(line("red:e4", 0, 4)).toEqual(["blue:e4", "red:f4", "blue:f4", "red:g4"]); // right
    expect(line("red:e4", 2, 4)).toEqual(["green:e4", "blue:e5", "yellow:e5", "red:f6"]); // up-right
  });

  it("stops at the edge of the grid", () => {
    expect(line("red:a1", 1, 3)).toEqual([]); // left
    expect(line("red:a1", 4, 3)).toEqual([]); // down-right
    expect(line("yellow:h8", 2, 3)).toEqual([]); // up-right
  });
});
