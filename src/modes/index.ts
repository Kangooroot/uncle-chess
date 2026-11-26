// Registry of the game modes. The server and the client only talk to modes
// through this map and the `GameMode` contract.

import type { BaseView, GameMode } from "../core";
import { classic } from "./classic";
import { french } from "./french";
import { tourcoing } from "./tourcoing";

/** In the order of the home screen (specs/UI.md). */
export const modes: Record<string, GameMode<unknown, unknown, BaseView>> = {
  [tourcoing.id]: tourcoing,
  [french.id]: french,
  [classic.id]: classic,
};

export const defaultMode = classic;

/** The mode with that id, or `null`. Safe with untrusted ids ("__proto__", "toString"…). */
export function findMode(id: unknown): GameMode<unknown, unknown, BaseView> | null {
  return typeof id === "string" && Object.hasOwn(modes, id) ? modes[id] : null;
}
