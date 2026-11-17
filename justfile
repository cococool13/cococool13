# CI contract. Agents, the pre-push hook and `ship` all run `just check`.
# Kit: .ci/ (vendored with ci-sync; `just ci-drift` shows drift).
# GitHub Actions still run here too (public repo): ci.yml runs the same tests,
# profile.yml publishes the images daily (not a check; stays on GitHub).
set shell := ["bash", "-euo", "pipefail", "-c"]

# Everything, in parallel.
check: setup
    .ci/bin/ci-par test oxlint gitleaks

# The whole suite takes under a second, so it runs on any change.
check-fast: setup
    #!/usr/bin/env bash
    set -euo pipefail
    base="$(git merge-base origin/main HEAD)"
    if [ -z "$({ git diff --name-only "$base"; git ls-files --others --exclude-standard; })" ]; then echo "check-fast: no changes"; exit 0; fi
    npm test

# No formatter is configured. Lowers the oxlint baseline after hits are fixed.
fix:
    .ci/bin/ci-oxlint --update

# From ci.yml (npm ci, npm test). Diff-only on PRs, one process per file, longest first.
test: setup
    .ci/bin/ci-test node

# Every oxlint rule, type-aware, against .oxlint-baseline.json (old hits may only go down).
oxlint:
    .ci/bin/ci-oxlint

setup:
    [ node_modules/.package-lock.json -nt package-lock.json ] || npm ci --no-audit --no-fund

# Full history, with the repo's .gitleaks.toml when there is one.
gitleaks:
    .ci/bin/ci-gitleaks

ci-drift:
    .ci/bin/ci-sync --check .

# Whole history (nightly).
gitleaks-full:
    .ci/bin/ci-gitleaks --full
