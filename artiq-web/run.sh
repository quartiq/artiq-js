#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

for cmd in npm go; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "Please install $cmd"
        exit 1
    fi
done

npm --prefix ../sipyco-js install
npm --prefix ../sipyco-js run format
npm --prefix ../sipyco-js run lint
npm --prefix ../sipyco-js run build
npm --prefix ../sipyco-js test -- --run

npm --prefix ../artiq-js install
npm --prefix ../artiq-js run format
npm --prefix ../artiq-js run lint
npm --prefix ../artiq-js run build

npm install
npm run format
npm run lint
npm run build

gofmt -w .
go vet ./...
go test ./...

# whitelist standard sipyco ports for broadcast, sync_struct and pc_rpc
# see: https://git.m-labs.hk/M-Labs/artiq/src/branch/master/doc/manual/default_network_ports.rst

# FIXME: standardize wsproxy port via ARTIQ repo
go run main.go --whitelist wsproxy.json localhost:1071
