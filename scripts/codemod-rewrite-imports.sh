#!/usr/bin/env bash
set -euo pipefail
# Rewrites bad imports "@/src/lib/db" -> "@/lib/db"
# Usage: bash scripts/codemod-rewrite-imports.sh
git ls-files | grep -E '\.(ts|tsx|js|jsx|mdx)$' | while read -r f; do
  if grep -q '@/src/lib/db' "$f"; then
    sed -i '' 's#@/src/lib/db#@/lib/db#g' "$f"
    echo "Rewrote import in $f"
  fi
done
