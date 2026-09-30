#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
project_dir="$PWD"

if [[ "${1:-}" != "--in-nix" ]]; then
  exec nix shell \
    'git+https://git.m-labs.hk/M-Labs/artiq.git?ref=release-9' \
    'git+https://git.m-labs.hk/M-Labs/artiq-comtools.git#artiq-comtools' \
    nixpkgs#nodejs_24 \
    --command bash "$project_dir/test/smoke.sh" --in-nix
fi

npm --prefix ../sipyco-js ci
npm --prefix ../sipyco-js run build
npm --prefix ../artiq-js ci
npm --prefix ../artiq-js run build
npm ci
npm run build:tests

smoke_dir="$(mktemp -d)"
master_pid=""
proxy_pid=""

cleanup() {
  status=$?
  if [[ -n "$proxy_pid" ]]; then
    kill "$proxy_pid" 2>/dev/null || true
    wait "$proxy_pid" 2>/dev/null || true
  fi
  if [[ -n "$master_pid" ]]; then
    kill "$master_pid" 2>/dev/null || true
    wait "$master_pid" 2>/dev/null || true
  fi
  if ((status != 0)); then
    for log in master.log proxy.log; do
      if [[ -f "$smoke_dir/$log" ]]; then
        cat "$smoke_dir/$log"
      fi
    done
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

printf '127.0.0.1:3250\n127.0.0.1:3251\n' >"$smoke_dir/wsproxy_targets.cfg"
artiq_wsproxy --no-localhost-bind --bind 127.0.0.1 \
  --allowed-targets "$smoke_dir/wsproxy_targets.cfg" \
  >"$smoke_dir/proxy.log" 2>&1 &
proxy_pid=$!

for ((i = 0; i < 100; i++)); do
  if (: > /dev/tcp/127.0.0.1/1071) 2>/dev/null; then
    break
  fi
  kill -0 "$proxy_pid"
  sleep 0.1
done
(: > /dev/tcp/127.0.0.1/1071) 2>/dev/null

node "$project_dir/out/test/artiq.smoke.js"
