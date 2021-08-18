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
  package=${p//\//_} # Replace / with _
  package=${package/@/} # Replace @ with nothing (@ is interpreted as a version delimiter in Yarn2)
  tar --sort=name --owner=root:0 --group=root:0 --mtime='UTC 2019-01-01' --create --directory "node_modules/${p}" --transform 's:^\.:package:' . | gzip -n > "dist/${package}.tgz"
done
