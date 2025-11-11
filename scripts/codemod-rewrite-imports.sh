#!/usr/bin/env bash
set -euo pipefail
# Normalize bad imports back to "@/lib/db"
git ls-files | grep -E '\.(ts|tsx|js|jsx|mdx)$' | while read -r f; do
  # Common wrong forms seen in the project
  sed -i '' 's#@/src/lib/db#@/lib/db#g' "$f"
  sed -i '' 's#@//src/lib/db#@/lib/db#g' "$f"
  sed -i '' 's#@/lib/db.ts#@/lib/db#g' "$f"
done
echo "Import paths normalized."
