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

npm install
npm run format
npm run lint
npm run build

npm run build:tests
npm test
