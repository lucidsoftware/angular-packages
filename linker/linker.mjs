import * as babel_1 from "@angular/compiler-cli/linker/babel";
import * as babel from "@babel/core";
import * as fs from "fs";

const inputPath = process.argv[2];
const outputPath = process.argv[3];
console.error(`Linking ${inputPath} with Angular Babel linker plugin`);
const result = babel.transformFileSync(inputPath, { plugins: [babel_1.default] });
fs.writeFileSync(outputPath, result.code);