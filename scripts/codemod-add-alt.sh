#!/usr/bin/env bash
# Adds missing alt="" to <img ...> tags that lack an alt attribute (simple heuristic).
set -euo pipefail
TARGETS=("src/components/search/CardDetailModal.tsx" "src/components/search/CardTile.tsx" "src/components/search/SuggestionsBox.tsx")
for f in "${TARGETS[@]}"; do
  if [ -f "$f" ]; then
    # Insert alt="" right after the first <img ... occurrence if no alt present on that tag line(s)
    # This is a naive approach; review diffs.
    perl -0777 -pe 's#<img(?![^>]*\balt=)([^>]*?)>#<img alt=""\1>#g' -i "$f"
    echo "Patched alt attribute in $f"
  fi
done
