---
name: commit
description: Split the pending changes into separate commits by type of change, following the project's gitmoji + Conventional Commits convention.
disable-model-invocation: true
---

# /commit

1. Read `specs/COMMITS.md`: it is the convention to apply, with no exceptions.
2. Inspect the changes: `git status`, `git diff`, `git diff --staged`, and the content of untracked files.
3. Group the changes into logical commits following the splitting rules in `specs/COMMITS.md`. If a file mixes several independent changes, split it by hunks (`git diff <file>` → partial patch → `git apply --cached`). If splitting is too fragile, attach the file to the main commit.
4. For each group, in the prescribed order:
   - `git add <exact paths>` (never `git add -A` or `git add .`);
   - `git commit` with a message following the convention, passed through a heredoc;
   - if a hook fails, fix the problem and create a new commit (no `--amend`, no `--no-verify`).
5. Finish with `git log --oneline -<n>` and show the list of created commits.

Never push (`git push`) unless explicitly asked. If some files look sensitive (secrets, `.dev.vars`) or unrelated to the project, do not commit them and point them out.
If `$ARGUMENTS` is given, it contains extra instructions from the user for this batch of commits (e.g. restrict to some files).
Talk to the user in French; write commit messages in English.
