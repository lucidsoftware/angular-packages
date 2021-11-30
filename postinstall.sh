#!/bin/bash
set -xe
patch-package
ngcc --tsconfig closure.tsconfig.json --target ngx-monaco-editor --loglevel debug --no-async
find node_modules/ngx-monaco-editor -name '*.js' -o -name '*.ts' -exec sed -i -r 's:^//# sourceMappingURL=.*::' {} \;
