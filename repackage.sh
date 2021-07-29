#!/bin/bash
set -euo pipefail

PACKAGES=(
  "@angular/animations"
  "@angular/common"
  "@angular/compiler-cli"
  "@angular/compiler"
  "@angular/core"
  "@angular/forms"
  "@angular/platform-browser-dynamic"
  "@angular/platform-browser"
  "@angular/router"
  "@angular/upgrade"
  "ngx-monaco-editor"
)

mkdir -p dist

for p in "${PACKAGES[@]}"; do
  echo "$p"
  tar --create --gzip --file "dist/${p//\//_}.tgz" --directory "node_modules/${p}" --transform 's:^\.:package:' .
done
