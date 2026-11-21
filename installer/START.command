#!/bin/sh
set -eu
cd -- "$(dirname -- "$0")"
fail() { printf '\n%s\n' "$1" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || fail 'Install Docker Desktop (Linux: Docker Engine + Compose v2), then start again.'
docker info >/dev/null 2>&1 || fail 'Start Docker Desktop / Docker Engine, wait until it is ready, then start again.'
docker compose version >/dev/null 2>&1 || fail 'Docker Compose v2 is required. Update Docker Desktop or install the Compose plugin.'
printf 'Loading the prepared application and model. First start may take a few minutes.\n'
docker load -i image.tar.gz || fail 'Could not load image.tar.gz. Extract the entire archive and check free disk space.'
docker compose up -d --wait --wait-timeout 120 || fail 'Could not start. Check Docker logs: docker compose logs. Port 18763 must be free.'
printf '\nReady: http://127.0.0.1:18763\nPlugin for Figma: plugin/manifest.json\nStop: docker compose down\n'
if [ "${SOBRANO_NO_BROWSER:-0}" != 1 ]; then
  if command -v open >/dev/null 2>&1; then open http://127.0.0.1:18763 || true
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open http://127.0.0.1:18763 >/dev/null 2>&1 || true; fi
fi
