import { describe, expect, it } from "vitest";
import { modes } from "../modes";
import { modeUIs } from "../modes/ui";

describe("modeUIs", () => {
  it("gives every mode of the registry a board and a preview", () => {
    expect(new Set(Object.keys(modeUIs))).toEqual(new Set(Object.keys(modes)));
  });
});
