# Branch and pull request workflow

## Context

Until now, Claude worked on a single branch per session. The user wants every change to go through a pull request.

## Decision

- Claude may create **one branch per topic** (from `main`) and open **one pull request for each**.
- **No over-splitting**: a topic groups everything that belongs together.
- Claude **alerts the user when a pull request gets big** and deserves a review before merging. Criteria are in [`specs/WORKFLOW.md`](../specs/WORKFLOW.md).

## Points of attention

- The repository has no CI yet: checks (`yarn typecheck`, `yarn test`) are run locally before each push. Adding a GitHub Action was suggested, not decided.
- `yarn deploy` deploys the local checkout, not `main`. Deploying only from `main` after a merge (manually or via CI) was suggested, not decided.
