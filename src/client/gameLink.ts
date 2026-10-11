// Game links: a game lives at `/g/<id>`, and players can share either the
// whole link or just the id (the "code").

const ID = "[a-z0-9]+";

/** The game id of a page path, or `undefined` on the home page. */
export function gameIdFromPath(path: string): string | undefined {
  return path.match(new RegExp(`^/g/(${ID})$`))?.[1];
}

/** The game id typed or pasted by a player: a full link or a bare code. */
export function parseGameInput(input: string): string | null {
  const text = input.trim().toLowerCase();
  return text.match(new RegExp(`^${ID}$`))?.[0] ?? text.match(new RegExp(`/g/(${ID})(?:[/?#]|$)`))?.[1] ?? null;
}
