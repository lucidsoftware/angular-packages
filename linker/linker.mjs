import * as angularLinker from "@angular/compiler-cli/linker/babel";
import * as babel from "@babel/core";
import * as fs from "fs";

const inputPath = process.argv[2];
const outputPath = process.argv[3];
console.error(`Linking ${inputPath} with Angular Babel linker plugin`);

const plugins = [
    [
        angularLinker.default,
        {
            sourceMapping: false,
            linkerJitMode: true,
            unknownDeclarationVersionHandling: 'error'
        }
    ],
];

const result = babel.transformFileSync(inputPath, {
    compact: false,
    plugins: plugins
});

fs.writeFileSync(outputPath, result.code);
