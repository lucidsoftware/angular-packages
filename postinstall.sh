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

(cd linker && npx yarn install)
# Remove unused packages and files
find node_modules/@angular/ -name '*.map' -delete
# Run Angular's Babel linker to produce AoT output (on all .mjs files)
find node_modules/@angular/**/fesm2022 -name '*.mjs' -not -path "node_modules/@angular/compiler/*" -not -path "node_modules/@angular/compiler-cli/*" -exec node linker/linker.mjs {} {} \;
# Remove source maps to decrease size and increase reproducibility
find node_modules/@angular -name '*.js' -o -name '*.ts' -exec sed -i -r 's:^//# sourceMappingURL=.*::' {} \;
