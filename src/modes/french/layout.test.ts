import { describe, expect, it } from "vitest";
import { CELLS, neighbours } from "./board";
import { hexCenter, W, WORLD } from "./layout";

const distance = (a: number, b: number, flipped = false) => {
  const p = hexCenter(a, flipped);
  const q = hexCenter(b, flipped);
  return Math.hypot(p.x - q.x, p.y - q.y);
};

describe("french board layout", () => {
  it("draws touching hexagons side by side, one hexagon width apart", () => {
    for (let cell = 0; cell < CELLS; cell++) {
      for (const n of neighbours(cell)) expect(distance(cell, n)).toBeCloseTo(W);
    }
  });

  it("keeps every hexagon inside the board, with white's first row at the bottom", () => {
    for (let cell = 0; cell < CELLS; cell++) {
      const { x, y } = hexCenter(cell, false);
      expect(x).toBeGreaterThan(W / 2);
      expect(x).toBeLessThan(WORLD.width - W / 2);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(WORLD.height);
    }
    expect(hexCenter(0, false).y).toBeGreaterThan(hexCenter(255, false).y); // red:a1 below yellow:h8
  });

  it("turns the board around for black", () => {
    const a1 = hexCenter(0, true);
    expect(a1.x).toBeCloseTo(WORLD.width - hexCenter(0, false).x);
    expect(hexCenter(0, true).y).toBeLessThan(hexCenter(255, true).y); // red:a1 now at the top
    expect(distance(0, 1, true)).toBeCloseTo(distance(0, 1));
  });
});
