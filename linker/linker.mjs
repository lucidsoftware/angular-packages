import * as babel_1 from "@angular/compiler-cli/linker/babel";
import * as babel from "@babel/core";
import * as fs from "fs";
import * as path from "path";

const inputPath = process.argv[2];
const outputPath = process.argv[3];
console.error(`Linking ${inputPath} with Angular Babel linker plugin`);
const result = babel.transformFileSync(inputPath, { plugins: [babel_1.default] });
if (false) {
    // Set this to true to write the files before and after transformation
    fs.mkdirSync(`diff/${path.dirname(inputPath)}`, {recursive: true});
    fs.writeFileSync(`diff/${inputPath.replace('.mjs', '.original.mjs')}`, fs.readFileSync(inputPath));
    fs.writeFileSync(`diff/${inputPath.replace('.mjs', '.babel.mjs')}`, result.code);
}
fs.writeFileSync(outputPath, result.code);