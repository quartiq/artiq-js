#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

for cmd in npm; do
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

npm run build:tests
npm test
