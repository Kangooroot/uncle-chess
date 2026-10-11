# Home screen redesign

Asked by the user after the Tourcoing mode was merged: a nicer main menu, working well on desktop and mobile. The user's own mockups will come later; this is a first version. Branch `feat/home-screen`.

## Decided
- **Mode cards with a start-position preview** instead of radio buttons. The preview comes from `mode.view(mode.setup(), "w")` and the mode's `ModeUI`, so every new mode gets its thumbnail for free and the `GameMode` contract does not change. The piece rendering helpers moved from `Game.tsx` to `src/client/pieces.tsx` to be shared.
- **One click to play**: each card's "Jouer" button creates the game. The development-only solo button became a "Solo" button on each card.
- **Nickname asked once**, then shown with a "Changer" button.
- **Join from a link or a code**: before, a game could only be joined by opening its link. `src/client/gameLink.ts` parses both.
- **Invite card** when a game link is opened without a nickname.
- Look: serif title (system font stack, no web font), faint checkerboard background, cards, the existing cream and green palette, dark mode kept. Phones: thumbnail beside the text; from 640px: centred grid of cards. 44px touch targets; the card hover lift is disabled with `prefers-reduced-motion`.
- UI text uses "vous", like the game screen.

## Left for later
- Showing the mode and the host on the invite card ("Rémi vous invite à jouer aux Échecs de Tourcoing"): the client would need to ask the server about the room before connecting, so a protocol change.
- A real rules page per mode: the card only shows the mode description for now.
- The user's own mockups.
