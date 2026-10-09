// Registry of the game modes. The server and the client only talk to modes
// through this map and the `GameMode` contract.

import type { GameMode } from "../core";
import { classic } from "./classic";

export const modes: Record<string, GameMode<unknown, unknown>> = {
  [classic.id]: classic,
};

export const defaultMode = classic;
