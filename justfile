# CI contract. Agents, the pre-push hook and `ship` all run `just check`.
# Kit: .ci/ (vendored with ci-sync; `just ci-drift` shows drift).
# GitHub Actions still run here too (public repo): ci.yml runs the same tests,
# profile.yml publishes the images daily (not a check; stays on GitHub).
set shell := ["bash", "-euo", "pipefail", "-c"]

check: setup
    .ci/bin/ci-par test gitleaks

# The whole suite takes under a second, so it runs on any change.
check-fast: setup
    #!/usr/bin/env bash
    set -euo pipefail
    base="$(git merge-base origin/main HEAD)"
    if [ -z "$({ git diff --name-only "$base"; git ls-files --others --exclude-standard; })" ]; then echo "check-fast: no changes"; exit 0; fi
    npm test

# No formatter is configured.
fix:
    @echo "fix: no autofixers in this repo"

# From ci.yml (npm ci, npm test).
test: setup
    npm test

setup:
    [ node_modules/.package-lock.json -nt package-lock.json ] || npm ci --no-audit --no-fund

# Full history, with the repo's .gitleaks.toml when there is one.
gitleaks:
    gitleaks git --no-banner --redact .

ci-drift:
    .ci/bin/ci-sync --check .
