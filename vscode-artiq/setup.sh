#!/bin/bash
set -e
cd "$(dirname "$0")" || exit 1

for cmd in npm; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "Please install $cmd"
        exit 1
    fi
done

npm install
npm run compile
