// Registry of the game modes. The server and the client only talk to modes
// through this map and the `GameMode` contract.

import type { GameMode } from "../core";
import { classic } from "./classic";
import { tourcoing } from "./tourcoing";

export const modes: Record<string, GameMode<unknown, unknown>> = {
  [classic.id]: classic,
  [tourcoing.id]: tourcoing,
};

export const defaultMode = classic;

/** The mode with that id, or `null`. Safe with untrusted ids ("__proto__", "toString"…). */
export function findMode(id: unknown): GameMode<unknown, unknown> | null {
  return typeof id === "string" && Object.hasOwn(modes, id) ? modes[id] : null;
}
