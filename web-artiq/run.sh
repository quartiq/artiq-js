#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

for cmd in npm go; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "Please install $cmd"
        exit 1
    fi
done

npm --prefix ../js-sipyco install
npm --prefix ../js-sipyco run format
npm --prefix ../js-sipyco run lint
npm --prefix ../js-sipyco run build
npm --prefix ../js-sipyco test -- --run

npm --prefix ../shared install
npm --prefix ../shared run format
npm --prefix ../shared run lint
npm --prefix ../shared run build

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
