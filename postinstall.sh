#!/bin/bash
set -xe

# Set to true to exit after applying patches (useful when modifying patches)
PATCHES_ONLY=false

patch-package

# Exit early if we're only applying patches
if [ "$PATCHES_ONLY" = true ]; then
    echo "PATCHES_ONLY mode enabled - exiting after patch-package"
    exit 0
fi

(cd linker && yarn install)
(cd ngcc-tools && yarn install)
# Remove unused packages and files
# find node_modules/@angular/**/esm2022 -maxdepth 0 -type d -exec rm -r {} \;
find node_modules/@angular/ -name '*.map' -delete
# Run Angular's Babel linker to produce AoT output (on all .mjs files)
find node_modules/@angular/**/fesm2022 -name '*.mjs' -not -path "node_modules/@angular/compiler/*" -not -path "node_modules/@angular/compiler-cli/*" -exec node linker/linker.mjs {} {} \;
# find node_modules/@angular/compiler/fesm2022 -name '*.mjs' -exec node linker/linker.mjs {} {} \;
# Move .d.ts files from types/ to fesm2022/ and update package.json exports
for pkg in node_modules/@angular/*; do
  if [ -d "$pkg/types" ] && [ "$pkg" != "node_modules/@angular/compiler" ] && [ "$pkg" != "node_modules/@angular/compiler-cli" ]; then
    node linker/types-mover.mjs "$pkg"
  fi
done
# Rewrite all relative imports to use package names (e.g., @angular/core/_chunk)
echo "Rewriting relative imports to use package names..."
# find node_modules/@angular/**/fesm2022 -name '*.mjs' -not -path "node_modules/@angular/compiler/*" -not -path "node_modules/@angular/compiler-cli/*" -exec node linker/rewrite-imports.mjs {} \;
# Process .d.ts files in package root (maxdepth 2 to get @angular/*/file.d.ts)
# find node_modules/@angular -maxdepth 2 -name '*.d.ts' -not -path "node_modules/@angular/compiler/*" -not -path "node_modules/@angular/compiler-cli/*" -exec node linker/rewrite-imports.mjs {} \;
# Remove now-empty types directories
for pkg in node_modules/@angular/*; do
  if [ -d "$pkg/types" ] && [ "$pkg" != "node_modules/@angular/compiler" ] && [ "$pkg" != "node_modules/@angular/compiler-cli" ]; then
    rm -rf "$pkg/types"
    echo "  Removed $pkg/types"
  fi
done
# Run ngcc for pre APF13 packages (using Angular 15's ngcc)
node ngcc-tools/ngcc.mjs --tsconfig closure.tsconfig.json --target ngx-monaco-editor --loglevel error --no-async
# Fix standalone flags in ngx-monaco-editor (add explicit standalone: false)
node ngcc-tools/fix-standalone.mjs
# Remove source maps to decrease size and increase reproducibility
find node_modules/ngx-monaco-editor node_modules/@angular -name '*.js' -o -name '*.ts' -exec sed -i -r 's:^//# sourceMappingURL=.*::' {} \;
# Clean up ngcc artifacts and source maps from ngx-monaco-editor
echo "Cleaning up ngx-monaco-editor artifacts..."
find node_modules/ngx-monaco-editor -name '*.map' -delete
find node_modules/ngx-monaco-editor -name '*.__ivy_ngcc_bak' -delete
