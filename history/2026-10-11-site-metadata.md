# Site name and link previews

Asked by the user: rename the site from "Uncle Chess" to "Jeux de tonton", make the HTML metadata French and descriptive, and get a proper preview when the link is shared. Branch `feat/site-metadata`.

## Decided

- Public name **Jeux de tonton**: page `<title>` and the home screen hero. The technical name `uncle-chess` (repository, `package.json`, Worker, production URL) is unchanged, since renaming the Worker would change the production URL.
- `index.html` (already `lang="fr"`) gets a French `description`, `theme-color`, a favicon, and Open Graph + `twitter:card` tags (`summary_large_image`).
- Static assets in `public/`: `og-image.png` (1200×630, the size every platform accepts) and `icon.png` (180×180, used as favicon and Apple touch icon). Both were rendered once with headless Chrome from small HTML pages in the site's colours; they are plain files, not generated at build time. SVG was avoided because most link-preview crawlers do not render it.
- `og:image` is an absolute URL to `https://uncle-chess.drissi-remi.workers.dev`: crawlers need absolute URLs. No `og:url`, so a shared `/g/<id>` link keeps its own URL; the SPA fallback serves the same `index.html`, so game links get the same preview.

## Points of attention

- If the site moves to another domain, update the `og:image` URL in `index.html`.
- Previews are cached by the platforms (WhatsApp, Facebook, Slack…). After a change, the Facebook Sharing Debugger or a new URL forces a refresh.
- Possible later: a per-game preview (mode name, players), which would need the Worker to rewrite the meta tags for `/g/<id>`.
