# Preview deployment per pull request

## Context
Rémi wants to work mostly by writing specs, with Claude coding the pull requests. Claude proposed a spec-driven workflow: spec → issue labelled for implementation → agent opens a PR (Claude GitHub Action) → CI + preview → Rémi tests and merges → automatic deploy. Proposed steps: issue template, Claude GitHub Action restricted to the owner, **per-PR previews**, branch protection on `main`, later an automated review. Previews were picked first: they let Rémi (a designer) test a change on his phone without reading code.

## Decided
- `.github/workflows/preview.yml` deploys each pull request as its own Worker, `uncle-chess-pr-<number>`, with its own Durable Objects. Production data is never shared.
- Updated on every push; the URL is posted once as a PR comment and shown as the `preview` GitHub environment.
- Deleted on close with `wrangler delete <name> --force` (`--force` skips the prompt and removes the Worker's Durable Objects).
- Same secrets as production (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`). Fork PRs are skipped.

## Rejected
- Cloudflare "Preview URLs" (`wrangler versions upload --preview-alias`): they would share production's Durable Objects, so preview games would mix with real ones, and their support for Workers with Durable Objects could not be checked (Cloudflare docs unreachable from the session). A separate Worker avoids both issues.

## Points of attention
- The free plan limits the number of Workers per account. One preview per open PR stays far below it, as long as closed PRs are cleaned up (check the `cleanup` job if a deletion fails).
- Next steps not done yet: issue template, Claude GitHub Action, branch protection.
