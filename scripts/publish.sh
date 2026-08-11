#!/usr/bin/env bash
set -euo pipefail

# Publish @toknt/* packages in dependency order, then the CLI.
# Requires: npm login locally, or NPM_TOKEN in CI

echo "Building all packages..."
npm run build

PACKAGES=(
  "@toknt/cache"
  "@toknt/tokenizer"
  "@toknt/core"
  "@toknt/optimizer"
  "@toknt/adapters"
  "@toknt/benchmark"
  "toknt"
)

for pkg in "${PACKAGES[@]}"; do
  echo "Publishing ${pkg}..."
  npm publish -w "${pkg}" --access public
done

echo "Done. Install with: npx toknt install"
