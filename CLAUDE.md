# Project rules

## Git commits

- Never add a `Co-Authored-By: Claude ...` (or similar AI attribution) trailer to commit messages in this repo. Claude should not appear in GitHub's Contributors list for this project.

## Deploying / branching

- Never push app code (or anything that changes site behavior) directly to `master`. `master` is production — Vercel deploys it live to the real site.
- Always do work on its own branch, push that branch, and open a PR. That gives a Vercel preview deployment to test against before anything touches production.
- Only merge to `master` once the user has confirmed the preview actually works.
- The one narrow exception is a repo-policy file like this one (`CLAUDE.md`) that has no effect on the deployed site — that can go straight to `master` since it doesn't change site behavior. When in doubt, branch instead.
