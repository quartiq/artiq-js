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

go run main.go localhost:8080
