#!/bin/sh
set -eu
version="${1:?Preview version required}"
printf '%s\n' "$version" | LC_ALL=C grep -Eq '^v[0-9]+\.[0-9]+\.[0-9]+-preview$' || exit 1
if draft=$(gh release view "$version" --json isDraft --jq .isDraft 2>/dev/null); then
  if [ "$draft" != true ]; then
    printf '%s\n' 'Release already published. Choose a new version; published installers are immutable.' >&2
    exit 1
  fi
  gh release edit "$version" --target "${GITHUB_SHA:?Source commit required}"
else
  gh release create "$version" --draft --prerelease --target "${GITHUB_SHA:?Source commit required}" --title 'Собрано — локальный установщик (preview)' --notes 'Готовые CPU-образы с моделью и собранный Figma-плагин. Нативный запуск в Figma Desktop ещё не подтверждён. Инструкция внутри ZIP.'
fi
