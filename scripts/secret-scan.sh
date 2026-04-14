#!/usr/bin/env bash
set -euo pipefail

# Scan staged additions only (new content), not full files.
staged_added_lines="$(git diff --cached --diff-filter=AM -U0 -- . | grep -E '^\+[^+]' || true)"

if [[ -z "${staged_added_lines}" ]]; then
  echo "Secret scan passed (no new staged lines to scan)."
  exit 0
fi

# Common secret signatures. Adjust over time for your stack.
secret_pattern='(AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|sk_live_[0-9A-Za-z]+|ghp_[0-9A-Za-z]{20,}|xox[baprs]-[0-9A-Za-z-]{10,}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----|(?i)(api[_-]?key|secret|token|password)\s*[:=]\s*["'\''`][^"'\''`]{8,}["'\''`])'

if echo "${staged_added_lines}" | grep -E -i "${secret_pattern}" >/dev/null; then
  echo ""
  echo "ERROR: Potential secret detected in staged changes."
  echo "Commit blocked to prevent accidental credential leaks."
  echo ""
  echo "Fix options:"
  echo "1) Move secrets into .env.local (already ignored by this repo)."
  echo "2) Use process.env.VAR_NAME in code instead of hardcoded values."
  echo "3) Unstage the file: git restore --staged <file>"
  echo ""
  echo "If this is a false positive, edit scripts/secret-scan.sh patterns."
  exit 1
fi

echo "Secret scan passed."
