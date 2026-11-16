# cococool13 (GitHub profile)

Builds the profile README images. `npm test` tests the builder; `.github/workflows/profile.yml` fetches GitHub data and publishes the images daily.

## Build and release rules

- Checks run on this Mac too. `just check` before claiming done (same command as pre-push and `ship`); `just check-fast` while working. Never `--no-verify`. Land work only with `.ci/bin/ship`: it checks the exact commit, posts `ci/just-check`, and merges or labels the PR `needs-cohen` (CI, hooks, workflows, release paths). GitHub Actions still run here (public repo). Merging never deploys; the daily `profile.yml` run publishes.
