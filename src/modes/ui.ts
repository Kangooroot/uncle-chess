// How each mode draws on the board, for the client only (React). Kept apart
// from the mode registry so the Worker does not bundle it.

import type { ReactElement } from "react";
import type { ViewPiece } from "../core";
import { tourcoingUI } from "./tourcoing/ui";

export type ModeUI = {
  /** Draws a piece, or `null` for the default drawing. `flipped`: black at the bottom. */
  renderPiece(piece: ViewPiece, flipped: boolean): ReactElement | null;
};

export const modeUIs: Partial<Record<string, ModeUI>> = { tourcoing: tourcoingUI };
