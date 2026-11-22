#!/bin/sh
set -eu
version="${1:?Release version required}"
printf '%s\n' "$version" | LC_ALL=C grep -Eq '^v[0-9]+\.[0-9]+\.[0-9]+(-preview)?$' || exit 1
if draft=$(gh release view "$version" --json isDraft --jq .isDraft 2>/dev/null); then
  if [ "$draft" != true ]; then
    printf '%s\n' 'Release already published. Choose a new version; published installers are immutable.' >&2
    exit 1
  fi
  gh release edit "$version" --target "${GITHUB_SHA:?Source commit required}"
else
  if [ "${version%-preview}" != "$version" ]; then
    gh release create "$version" --draft --prerelease --target "${GITHUB_SHA:?Source commit required}" --title 'Собрано — редактор иллюстраций' --notes 'Браузерный редактор, исходные40вариантов и локальная CPU-модель. Запуск готового комплекта одной командой; инструкция внутри ZIP.'
  else
    gh release create "$version" --draft --target "${GITHUB_SHA:?Source commit required}" --title 'Собрано — редактор иллюстраций' --notes 'Браузерный редактор, исходные40вариантов и локальная CPU-модель. Запуск готового комплекта одной командой; инструкция внутри ZIP.'
  fi
fi
