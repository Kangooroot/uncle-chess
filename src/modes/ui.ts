// How each mode draws its board, for the client only (React). Kept apart
// from the mode registry so the Worker does not bundle it.

import type { ComponentType } from "react";
import type { BaseView, Color, GameMode } from "../core";
import { squareBoardUI } from "../client/SquareBoard";
import { classic } from "./classic";
import { french } from "./french";
import { frenchUI } from "./french/ui";
import { tourcoing } from "./tourcoing";
import { tourcoingUI } from "./tourcoing/ui";

export type BoardProps<View> = {
  view: View;
  /** The side the player moves right now, or `null` when they cannot move (opponent's turn, spectator, game over). */
  player: Color | null;
  /** Black at the bottom. */
  flipped: boolean;
  /** Plays an action of the mode. Returns `false` if it is illegal. */
  play(action: unknown): boolean;
};

export type ModeUI<View> = {
  /** The game board: draws the view and turns the player's clicks and drags into actions. */
  Board: ComponentType<BoardProps<View>>;
  /** The static start-position thumbnail of the mode's card on the home screen. */
  Preview: ComponentType<{ view: View }>;
};

/** Pairs a mode with a UI that draws its view type. */
function entry<View extends BaseView>(mode: GameMode<unknown, unknown, View>, ui: ModeUI<View>) {
  return [mode.id, ui as ModeUI<BaseView>] as const;
}

/** The UI of every mode of the registry, by mode id. */
export const modeUIs: Record<string, ModeUI<BaseView>> = Object.fromEntries([
  entry(classic, squareBoardUI()),
  entry(tourcoing, tourcoingUI),
  entry(french, frenchUI),
]);
