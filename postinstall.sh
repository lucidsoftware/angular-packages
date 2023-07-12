#!/bin/bash
set -xe
patch-package
# COMMENT EVERYTHING BELOW THIS LINE BEFORE CHANGING PATCHES
# Remove unused packages and files
find node_modules/@angular/**/esm2022 -maxdepth 0 -type d -exec rm -r {} \;
find node_modules/@angular/ -name '*.map' -delete
# Run Angular's Babel linker to produce AoT output
find node_modules/@angular/**/fesm2022 -name '*.mjs' -exec node linker/linker.mjs {} {} \;
# Run ngcc for pre APF13 packages
ngcc --tsconfig closure.tsconfig.json --target ngx-monaco-editor --loglevel debug --no-async
# Remove source maps to decrease size and increase reproducibility
find node_modules/ngx-monaco-editor node_modules/@angular -name '*.js' -o -name '*.ts' -exec sed -i -r 's:^//# sourceMappingURL=.*::' {} \;
