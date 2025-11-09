#!/usr/bin/env bash
set -euo pipefail
git ls-files | grep -E '\.(ts|tsx|js|jsx|mdx)$' | while read -r f; do
  if grep -q "@/src/lib/fileUpload" "$f"; then
    sed -i '' 's#@/src/lib/fileUpload#@/lib/fileUpload#g' "$f"
    echo "Rewrote fileUpload import in $f"
  fi
done
