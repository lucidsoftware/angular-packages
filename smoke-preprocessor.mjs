import fs from 'fs';
import os from 'os';
import path from 'path';
import ts from 'typescript';
import {NgtscIsolatedPreprocessor} from '@angular/compiler-cli/private/preprocessor';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ng-preprocessor-smoke-'));
const root = path.join(dir, 'smoke.component.ts');

fs.writeFileSync(
  root,
  [
    "import {Component} from '@angular/core';",
    "@Component({selector: 'x-smoke', template: '{{name}}'})",
    "export class SmokeComponent { name = 'ok'; }",
    '',
  ].join('\n'),
);

const options = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  strict: true,
  skipLibCheck: true,
  experimentalDecorators: true,
  _enableTemplateTypeChecker: true,
};

const host = ts.createCompilerHost(options);
const preprocessor = new NgtscIsolatedPreprocessor([root], options, host);
const outputs = preprocessor.transformAndPrint();
const rootOutput = outputs.find((output) => output.fileName === root);
const typeCheckShim = outputs.find((output) => output.fileName.endsWith('.ngtypecheck.ts'));

if (!rootOutput?.content.includes('ɵcmp')) {
  throw new Error('Expected transformed component output containing Angular component definition');
}

if (!typeCheckShim) {
  throw new Error('Expected Angular template type-check shim output');
}

if (!typeCheckShim.content.includes('function _tcb') || !typeCheckShim.content.includes(').name')) {
  throw new Error('Expected Angular template type-check shim to contain a real TCB for the template binding');
}

console.log(`NgtscIsolatedPreprocessor smoke passed with ${outputs.length} output files`);
