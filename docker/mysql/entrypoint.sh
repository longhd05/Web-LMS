#!/usr/bin/env bash
set -euo pipefail

DATADIR="${MYSQL_DATADIR:-/var/lib/mysql}"

if [ ! -d "$DATADIR" ]; then
  mkdir -p "$DATADIR"
fi

# If MySQL crashed during first init, the datadir can contain partial files
# and then restart forever with "--initialize specified but the data directory has files in it".
if [ "${MYSQL_AUTO_CLEAN_PARTIAL_INIT:-1}" = "1" ]; then
  if [ -n "$(ls -A "$DATADIR" 2>/dev/null || true)" ] && [ ! -d "$DATADIR/mysql" ]; then
    echo "[mysql-preflight] Detected partial MySQL initialization in $DATADIR. Cleaning stale files..."
    rm -rf "${DATADIR:?}"/*
  fi
fi

# Fail fast with a clear message if the Docker host volume is full/read-only.
if ! touch "$DATADIR/.write-test" 2>/dev/null; then
  echo "[mysql-preflight] ERROR: Cannot write to $DATADIR."
  echo "[mysql-preflight] Check host disk space with: df -h"
  echo "[mysql-preflight] Then reset the volume with: docker compose down -v"
  exit 1
fi
rm -f "$DATADIR/.write-test"

exec docker-entrypoint.sh "$@"
