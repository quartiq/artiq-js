#!/bin/bash

set -e

cd "$(dirname "$0")" || exit 1

for cmd in npm go; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "Please install $cmd"
        exit 1
    fi
done

npm install
npm run build
go test ./...

# whitelist standard sipyco ports for broadcast, sync_struct and pc_rpc
# see: https://git.m-labs.hk/M-Labs/artiq/src/branch/master/doc/manual/default_network_ports.rst

# FIXME: standardize wsproxy port via ARTIQ repo
go run main.go --whitelist wsproxy.json localhost:1071
