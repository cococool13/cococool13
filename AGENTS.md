# cococool13 (GitHub profile)

Builds the profile README images. `npm test` tests the builder. Nothing refreshes them on a schedule; rebuild by hand:

```sh
npm ci
gh api graphql -F login=cococool13 -f query="$(cat scripts/query.graphql)" > /tmp/data.json
node scripts/build.mjs /tmp/data.json   # writes assets/
```

The README loads the images from the `output` branch: a one-commit branch holding only the contents of `assets/`, force-pushed each time (the old publish step is in `git log -p -- .github/workflows/profile.yml`). That force-push needs Cohen's yes.

## Build and release rules

- Checks run on this Mac too. `just check` before claiming done (same command as pre-push and `ship`); `just check-fast` while working. Never `--no-verify`. Land work only with `.ci/bin/ship`: it checks the exact commit, posts `ci/just-check`, and merges or labels the PR `needs-cohen` (CI, hooks, workflows, release paths). Merging never deploys. Publishing is the approved force-push to `output` above; the rebuild alone changes nothing live.
