# CI pipeline and deployment on merge

Follows [`2026-10-08-branch-workflow.md`](2026-10-08-branch-workflow.md), which left CI and deployment from `main` open. Both are now decided.

## Decision

- **CI** (GitHub Actions, `ci.yml`): typecheck and tests on every pull request.
- **Continuous deployment** (`deploy.yml`): every push to `main` reruns CI, then deploys to Cloudflare with `yarn deploy`. Production always reflects `main`.
- CI is a reusable workflow (`workflow_call`) called by the deploy workflow, so pushes to `main` don't run it twice.
- Deployments are queued (`cancel-in-progress: false`) so two quick merges can't leave a half-finished deploy.
- The deploy job uses a GitHub `production` environment, which gives a deployment history and a link to the live site.

## Points of attention

- The secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` must be set in the GitHub repository, otherwise the deploy job fails.
- The API token should be scoped to the minimum: "Edit Cloudflare Workers" template.
- No preview deployment per pull request yet. Cloudflare preview URLs could provide one later.
