#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

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

npm run watch
