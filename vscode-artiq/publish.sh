#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

cp ../LICENSE ../LICENSE.GPL-3 .
vsce package
vsce publish
npx ovsx publish "$1"
