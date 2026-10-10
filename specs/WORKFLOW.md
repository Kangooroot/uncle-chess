# Branches and pull requests

Decided on 2026-10-08 (see [`history/2026-10-08-branch-workflow.md`](../history/2026-10-08-branch-workflow.md)).

## Branches

- **One branch per topic**, created from the latest `main`. Never commit directly to `main`.
- Naming: `<type>/<short-topic>`, where `<type>` is a commit type from [`COMMITS.md`](COMMITS.md) (e.g. `feat/mad-king-mode`, `fix/reconnection`, `docs/branch-workflow`).
- A topic is a coherent change the user asked for. **Do not over-split**: related changes (a feature, its tests, its spec and its history file) belong in the same branch.

## Pull requests

- Claude opens **one pull request per branch**, targeting `main`, as soon as the topic is pushed.
- Before pushing: `yarn typecheck` and `yarn test` must pass locally. CI runs them again on the pull request.
- Title and description **in French** (see [`MAIN.md`](MAIN.md)). Description: what changed and why, how it was checked, anything left open, and what to review.

## Big pull requests

Claude **warns the user** when a pull request becomes big enough to deserve a careful review before merging, instead of silently splitting it. Signals:

- roughly more than 400 changed lines, excluding the lockfile and generated files;
- changes to the protocol, the server's authority or synchronisation logic, or storage in the Durable Object;
- a new game mode or a change to the `GameMode` contract;
- a migration (e.g. `Variant` → `GameMode`) or a breaking change.

The warning says what makes it big and which parts deserve the closest look.

## Continuous integration and deployment

Decided on 2026-10-08 (see [`history/2026-10-08-ci-and-deploy.md`](../history/2026-10-08-ci-and-deploy.md)).

- `.github/workflows/ci.yml`: on every pull request, `yarn typecheck` and `yarn test`. A pull request is not mergeable while CI is red.
- `.github/workflows/deploy.yml`: on every push to `main` (so on every merge), runs CI again, then `yarn deploy` to Cloudflare. Deployments are queued, never cancelled halfway.
- Production is therefore always what is on `main`. Do not deploy a branch by hand.
- Required GitHub secrets: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
