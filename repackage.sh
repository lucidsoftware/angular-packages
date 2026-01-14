#!/bin/bash
set -euo pipefail

PACKAGES=(
  "@angular/common"
  "@angular/compiler-cli"
  "@angular/compiler"
  "@angular/core"
  "@angular/forms"
  "@angular/platform-browser-dynamic"
  "@angular/platform-browser"
  "@angular/router"
  "@angular/upgrade"
)

mkdir -p dist

for p in "${PACKAGES[@]}"; do
  echo "Packaging" "$p"
  (cd "node_modules/${p}" && npm pack --pack-destination "../../../dist/" > /dev/null 2>&1)
done

echo "Packaging ngx-monaco-editor"
(cd "node_modules/ngx-monaco-editor" && npm pack --pack-destination "../../dist/" > /dev/null 2>&1)