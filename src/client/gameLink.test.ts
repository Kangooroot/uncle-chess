import { describe, expect, it } from "vitest";
import { gameIdFromPath, parseGameInput } from "./gameLink";

describe("gameIdFromPath", () => {
  it("reads the id of a game page", () => {
    expect(gameIdFromPath("/g/abc234")).toBe("abc234");
  });

  it("returns undefined elsewhere", () => {
    expect(gameIdFromPath("/")).toBeUndefined();
    expect(gameIdFromPath("/g/")).toBeUndefined();
    expect(gameIdFromPath("/g/abc/x")).toBeUndefined();
  });
});

describe("parseGameInput", () => {
  it("accepts a bare code, whatever its case and surrounding spaces", () => {
    expect(parseGameInput("  AbC234 ")).toBe("abc234");
  });

  it("accepts a full link, with or without a query", () => {
    expect(parseGameInput("https://uncle-chess.example/g/abc234")).toBe("abc234");
    expect(parseGameInput("https://uncle-chess.example/g/abc234?mode=tourcoing")).toBe("abc234");
    expect(parseGameInput("uncle-chess.example/g/abc234#x")).toBe("abc234");
  });

  it("rejects anything else", () => {
    expect(parseGameInput("")).toBeNull();
    expect(parseGameInput("pas un code")).toBeNull();
    expect(parseGameInput("https://example.com/other")).toBeNull();
  });
});
