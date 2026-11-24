import { describe, expect, it } from "vitest";
import { french, fromPlacements, legalMoves, toCell, type FrenchState } from ".";

/** Plays moves written as "red:g1-red:f3", each by the side to move. `null` if one is illegal. */
function play(moves: string, state: FrenchState = french.setup()): FrenchState | null {
  for (const m of moves.split(" ")) {
    const [from, to] = m.split("-");
    const next = french.play(state, { from, to }, state.turn);
    if (!next) return null;
    state = next;
  }
  return state;
}

const view = (state: FrenchState) => french.view(state, "spectator");
const classicTo = (state: FrenchState, cell: string) => new Set(view(state).moves[cell]);
const hexTo = (state: FrenchState, cell: string) => new Set(view(state).hexMoves[cell]);

// Placements are FEN-like, one per board (red, blue, green, yellow); `null` is a forbidden board.
const EMPTY = "8/8/8/8/8/8/8/8";

const distinct = (pairs: string[]) => new Set(pairs).size;

/** How far a white piece on red:d4 can jump to the right, on an otherwise empty line. */
function rightRange(piece: string): number {
  // A rook on green keeps enough material on the board.
  const state = fromPlacements([`8/8/8/8/3${piece}4/8/8/7K`, "7k/8/8/8/8/8/8/8", "8/8/8/8/8/8/8/R7", EMPTY]);
  const line = ["blue:d4", "red:e4", "blue:e4", "red:f4", "blue:f4", "red:g4", "blue:g4", "red:h4", "blue:h4"];
  return line.filter((cell) => hexTo(state, "red:d4").has(cell)).length;
}

describe("french", () => {
  describe("setup", () => {
    it("starts with the classic position on all four boards, white to move", () => {
      const state = french.setup();
      const { pieces } = view(state);
      expect(Object.keys(pieces)).toHaveLength(128);
      for (const board of ["red", "blue", "green", "yellow"]) {
        expect(pieces[`${board}:e1`]).toEqual({ color: "w", kind: "k" });
        expect(pieces[`${board}:d8`]).toEqual({ color: "b", kind: "q" });
        expect(pieces[`${board}:a2`]).toEqual({ color: "w", kind: "p", dir: "n" });
      }
      expect(french.toPlay(state)).toBe("w");
      expect(french.status(state)).toEqual({ kind: "playing" });
    });

    it("has no hexagonal move at the start: every piece stands on its first rank", () => {
      const state = french.setup();
      expect(legalMoves(state)).toHaveLength(4 * 20);
      expect(view(state).hexMoves).toEqual({});
    });
  });

  describe("hexagonal moves", () => {
    it("open up once a piece leaves its first rank", () => {
      const state = play("red:b1-red:c3 blue:b8-blue:c6")!;
      const hex = hexTo(state, "red:c3");
      expect(hex.size).toBeGreaterThan(0);
      expect(hex.has("red:d3")).toBe(true); // 2 sideways: stays on its board, one file over
      expect(hex.has("blue:c3")).toBe(true); // 1 to the right: another board
      for (const cell of hex) expect(view(state).pieces[cell]).toBeUndefined(); // never captures
    });

    it("go up to 3 hexagons for knights and bishops, 5 for rooks, 9 for queens", () => {
      expect(rightRange("N")).toBe(3);
      expect(rightRange("B")).toBe(3);
      expect(rightRange("R")).toBe(5);
      expect(rightRange("Q")).toBe(9);
    });

    it("stop at the first occupied hexagon", () => {
      const state = fromPlacements(["8/8/8/8/3R4/8/8/7K", "7k/8/8/8/4p3/8/8/8", EMPTY, EMPTY]);
      const hex = hexTo(state, "red:d4");
      expect(hex.has("red:e4")).toBe(true);
      expect(hex.has("blue:e4")).toBe(false); // black pawn
      expect(hex.has("red:f4")).toBe(false); // behind it
    });

    it("are not for kings and pawns, nor from the player's first rank", () => {
      const white = fromPlacements(["8/8/8/8/3K4/2P5/8/R7", "7k/8/8/8/8/8/8/8", EMPTY, EMPTY]);
      expect(view(white).hexMoves).toEqual({});
      // Black's first rank is the 8th: a black rook on rank 1 can jump.
      const black = fromPlacements(["r6k/8/8/8/8/8/8/r6K", EMPTY, EMPTY, EMPTY], { turn: "b" });
      expect(view(black).hexMoves["red:a8"]).toBeUndefined();
      expect(view(black).hexMoves["red:a1"]).toContain("blue:a1");
    });

    it("cross a forbidden board but never stop on it", () => {
      const state = fromPlacements(["8/8/8/8/3R4/8/8/7K", null, "7k/8/8/8/8/8/8/8", EMPTY]);
      const hex = hexTo(state, "red:d4");
      expect(hex.has("blue:d4")).toBe(false);
      expect(hex.has("red:e4")).toBe(true);
      expect(hex.has("blue:e4")).toBe(false);
      expect(hex.has("red:f4")).toBe(true);
    });

    it("keep the piece's side on its new board", () => {
      const state = play("red:b1-red:c3 blue:b8-blue:c6 red:c3-blue:c3")!;
      expect(view(state).pieces["blue:c3"]).toEqual({ color: "w", kind: "n" });
      expect(view(state).pieces["red:c3"]).toBeUndefined();
    });

    it("can give check from the arrival hexagon", () => {
      // The rook jumps one hexagon to the right, onto blue:c4, and attacks the blue king on c8.
      const state = play("red:c4-blue:c4", fromPlacements(["8/8/8/8/2R5/8/8/7K", "2k5/8/8/8/8/8/8/8", EMPTY, EMPTY]))!;
      expect(view(state).check).toEqual(["blue:c8"]);
      expect(french.toPlay(state)).toBe("b");
    });
  });

  describe("check", () => {
    it("can be parried by a piece jumping in from another board", () => {
      const state = fromPlacements(["4k3/8/8/8/8/8/8/4R2K", "8/8/8/8/4r3/8/8/8", null, null], { turn: "b" });
      expect(view(state).check).toEqual(["red:e8"]);
      expect(classicTo(state, "blue:e4")).toEqual(new Set()); // no classic rook move parries
      // Jumps back onto the e-file do: 1 to the left, or 2 on a diagonal.
      expect(hexTo(state, "blue:e4")).toEqual(new Set(["red:e3", "red:e4", "red:e5"]));
    });

    it("forbids leaving one's own king in check, a jump included", () => {
      // The red rook on e4 is pinned against its king.
      const state = fromPlacements(["4r2k/8/8/8/4R3/8/8/4K3", EMPTY, EMPTY, EMPTY]);
      expect(hexTo(state, "red:e4")).toEqual(new Set());
      expect(classicTo(state, "red:e4").has("red:e8")).toBe(true);
    });

    it("forbids checks on two boards with one move", () => {
      // The knight on red:e4 blocks the rook. Jumping onto blue:e4 would check the
      // blue king on f6 and uncover the rook's check on red:e8: forbidden.
      // Jumping onto blue:d4 only uncovers the red check: allowed.
      const state = fromPlacements(["4k3/8/8/8/4N3/8/8/4R2K", "8/8/5k2/8/8/8/8/8", EMPTY, EMPTY]);
      const hex = hexTo(state, "red:e4");
      expect(hex.has("blue:e4")).toBe(false);
      expect(hex.has("blue:d4")).toBe(true);
      expect(view(play("red:e4-blue:d4", state)!).check).toEqual(["red:e8"]);
    });
  });

  describe("mate", () => {
    // Back-rank mate on red. Black has nothing that could jump in to block.
    const BACK_RANK = ["6k1/5ppp/8/8/8/8/8/4R1K1", "k7/8/8/8/8/8/7R/7K", null, null];

    it("empties the board, forbids it, scores a point and lets the mated player move", () => {
      const state = play("red:e1-red:e8", fromPlacements(BACK_RANK))!;
      const { pieces, forbidden, score } = view(state);
      expect(Object.keys(pieces).filter((cell) => cell.startsWith("red:"))).toEqual([]);
      expect(forbidden).toEqual(["red", "green", "yellow"]);
      expect(score).toEqual({ w: 1, b: 0 });
      expect(french.toPlay(state)).toBe("b");
      expect(french.status(state)).toEqual({ kind: "playing" });
    });

    it("wins the game at the second mate", () => {
      const state = play("red:e1-red:e8", fromPlacements(BACK_RANK, { score: { w: 1, b: 0 } }))!;
      expect(french.status(state)).toEqual({ kind: "win", winner: "w", reason: "mates" });
      expect(french.toPlay(state)).toBeNull();
    });
  });

  describe("endings", () => {
    const STALEMATE = ["k7/8/1Q6/8/8/8/8/7K", null, null, null];

    it("draws on stalemate: no legal move on any board", () => {
      const state = fromPlacements(STALEMATE, { turn: "b" });
      expect(french.status(state)).toEqual({ kind: "draw", reason: "stalemate" });
    });

    it("gives the win to the player who leads on mates instead", () => {
      expect(french.status(fromPlacements(STALEMATE, { turn: "b", score: { w: 1, b: 0 } }))).toEqual({
        kind: "win",
        winner: "w",
        reason: "stalemate-lead",
      });
      expect(french.status(fromPlacements(STALEMATE, { turn: "b", score: { w: 0, b: 1 } }))).toEqual({
        kind: "win",
        winner: "b",
        reason: "stalemate-lead",
      });
    });

    it("draws on insufficient material, counted over all boards", () => {
      const kings = ["k7/8/8/8/8/8/8/7K", "k7/8/8/8/8/8/8/7K", null, null];
      expect(french.status(fromPlacements(kings))).toEqual({ kind: "draw", reason: "material" });
      const knight = ["k7/8/8/8/8/8/8/6NK", "k7/8/8/8/8/8/8/7K", null, null];
      expect(french.status(fromPlacements(knight))).toEqual({ kind: "draw", reason: "material" });
      expect(french.status(fromPlacements(knight, { score: { w: 0, b: 1 } }))).toEqual({
        kind: "win",
        winner: "b",
        reason: "material-lead",
      });
      const two = ["k7/8/8/8/8/8/8/6NK", "k7/8/8/8/8/8/8/6BK", null, null];
      expect(french.status(fromPlacements(two))).toEqual({ kind: "playing" });
    });

    it("makes the player who produces the third repetition lose", () => {
      const round = "red:g1-red:f3 red:g8-red:f6 red:f3-red:g1 red:f6-red:g8";
      const twice = play(`${round} ${round.split(" ").slice(0, 3).join(" ")}`)!;
      expect(french.status(twice)).toEqual({ kind: "playing" });
      const third = play("red:f6-red:g8", twice)!; // black brings the start position back a third time
      expect(french.status(third)).toEqual({ kind: "win", winner: "w", reason: "repetition" });
    });
  });

  describe("classic rules on each board", () => {
    it("castles", () => {
      const state = play("red:e1-red:g1", fromPlacements(["r3k2r/8/8/8/8/8/8/R3K2R", EMPTY, EMPTY, EMPTY]))!;
      expect(view(state).pieces["red:f1"]).toEqual({ color: "w", kind: "r" });
    });

    it("promotes into a queen by default", () => {
      const state = play("red:a7-red:a8", fromPlacements(["7k/P7/8/8/8/8/8/7K", EMPTY, EMPTY, EMPTY]))!;
      expect(view(state).pieces["red:a8"]).toEqual({ color: "w", kind: "q" });
    });
  });

  it("plays a random game where every move the view offers is accepted", () => {
    let seed = 7;
    const random = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    let state = french.setup();
    for (let ply = 0; ply < 120 && french.toPlay(state); ply++) {
      const { moves, hexMoves } = view(state);
      const offered = [...Object.entries(moves), ...Object.entries(hexMoves)].flatMap(([from, targets]) =>
        targets!.map((to) => ({ from, to })),
      );
      // A destination reachable both by a classic and a hexagonal move is offered twice.
      expect(distinct(offered.map(({ from, to }) => `${from}-${to}`))).toBe(
        distinct(legalMoves(state).map((m) => `${toCell(m.from)}-${toCell(m.to)}`)),
      );
      const next = french.play(state, offered[Math.floor(random() * offered.length)], state.turn);
      expect(next).not.toBeNull();
      state = next!;
    }
  });

  describe("actions", () => {
    it("rejects malformed, illegal and out-of-turn actions", () => {
      const state = french.setup();
      for (const action of [null, "e2e4", { from: "e2", to: "e4" }, { from: "purple:e2", to: "red:e4" }])
        expect(french.play(state, action as never, "w")).toBeNull();
      expect(french.play(state, { from: "red:e2", to: "red:e5" }, "w")).toBeNull();
      expect(french.play(state, { from: "red:e7", to: "red:e5" }, "b")).toBeNull();
      expect(french.play(state, { from: "red:e2", to: "red:e4" }, "w")).not.toBeNull();
    });
  });
});
