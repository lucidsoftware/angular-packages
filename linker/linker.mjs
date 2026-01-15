import * as angularLinker from "@angular/compiler-cli/linker/babel";
import * as fs from "fs";
import { rollup } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { babel } from "@rollup/plugin-babel";

const inputPath = process.argv[2];
const outputPath = process.argv[3];
console.error(`Linking and bundling ${inputPath}`);

// Single-pass: Bundle with Rollup and run Angular linker via Babel plugin
const bundle = await rollup({
    input: inputPath,
    plugins: [
        // First resolve internal imports
        nodeResolve({
            resolveOnly: []
        }),
        // Then run Angular linker with Babel
        babel({
            babelHelpers: 'bundled',
            compact: false,
            plugins: [
                [
                    angularLinker.default,
                    {
                        sourceMapping: false,
                        linkerJitMode: true,
                        unknownDeclarationVersionHandling: 'error'
                    }
                ]
            ]
        })
    ],
    // Mark all non-relative imports as external
    external: (id) => {
        // Keep @angular/*, rxjs/*, tslib, and other node_modules as external
        return !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\0');
    },
    onwarn: (warning, warn) => {
        // Suppress certain warnings if needed
        if (warning.code === 'THIS_IS_UNDEFINED') return;
        warn(warning);
    }
});

const { output } = await bundle.generate({
    format: 'es',
    compact: false,
    sourcemap: false
});

// Write the bundled output
fs.writeFileSync(outputPath, output[0].code);

console.error(`Successfully bundled ${outputPath}`);