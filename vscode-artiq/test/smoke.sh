#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
project_dir="$PWD"

if [[ "${1:-}" != "--in-nix" ]]; then
  exec nix shell \
    'git+https://git.m-labs.hk/M-Labs/artiq.git?ref=release-9' \
    nixpkgs#nodejs_24 \
    --command bash "$project_dir/test/smoke.sh" --in-nix
fi

npm --prefix ../js-sipyco ci
npm --prefix ../js-sipyco run build
npm --prefix ../shared ci
npm --prefix ../shared run build
npm ci
npm run build:tests

smoke_dir="$(mktemp -d)"
master_pid=""

cleanup() {
  status=$?
  if [[ -n "$master_pid" ]]; then
    kill "$master_pid" 2>/dev/null || true
    wait "$master_pid" 2>/dev/null || true
  fi
  if ((status != 0)); then
    cat "$smoke_dir/master.log"
  fi
  rm -rf "$smoke_dir"
}
trap cleanup EXIT

mkdir "$smoke_dir/repository"
printf 'device_db = {}\n' >"$smoke_dir/device_db.py"

(
  cd "$smoke_dir"
  exec env PYTHONUNBUFFERED=1 artiq_master --bind 127.0.0.1
) >"$smoke_dir/master.log" 2>&1 &
master_pid=$!

for ((i = 0; i < 100; i++)); do
  kill -0 "$master_pid"
  if grep -q 'ARTIQ master is now ready' "$smoke_dir/master.log"; then
    break
  fi
  sleep 0.1
done

grep -q 'ARTIQ master is now ready' "$smoke_dir/master.log"
node "$project_dir/out/test/artiq.smoke.js"
