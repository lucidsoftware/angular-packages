import * as fs from "fs";
import * as path from "path";

const packagePath = process.argv[2]; // e.g., node_modules/@angular/core

console.error(`Moving .d.ts files to package root for ${packagePath}`);

// Read package.json to find all entry points
const packageJsonPath = path.join(packagePath, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.error(`package.json not found at ${packageJsonPath}`);
    process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

if (!packageJson.exports) {
    console.error('No exports found in package.json');
    process.exit(0);
}

const packageName = path.basename(packagePath); // e.g., 'core'
const mainTypesFile = `${packageName}.d.ts`; // e.g., 'core.d.ts'

// First, move all .d.ts files from types/ to package root
const typesDir = path.join(packagePath, 'types');

if (fs.existsSync(typesDir)) {
    const files = fs.readdirSync(typesDir);
    for (const file of files) {
        if (file.endsWith('.d.ts')) {
            const sourcePath = path.join(typesDir, file);
            let targetPath;

            // Rename main entry file to index.d.ts
            if (file === mainTypesFile) {
                targetPath = path.join(packagePath, 'index.d.ts');
                console.error(`  Moved ${file} -> index.d.ts`);
            } else {
                targetPath = path.join(packagePath, file);
                console.error(`  Moved ${file} to package root`);
            }

            fs.renameSync(sourcePath, targetPath);
        }
    }
}

let movedCount = 0;
let packageJsonModified = false;

// Update typings field to point to index.d.ts
if (packageJson.typings && packageJson.typings.startsWith('./types/')) {
    packageJson.typings = './index.d.ts';
    packageJsonModified = true;
    console.error(`  Updated "typings" field to ./index.d.ts`);
}

// Collect exports to normalize (exports that need path changes)
const exportsToNormalize = [];

// Iterate through all exports and update types paths
for (const [exportPath, exportConfig] of Object.entries(packageJson.exports)) {
    // Skip non-object exports
    if (typeof exportConfig !== 'object' || !exportConfig.types) {
        continue;
    }

    const oldTypesPath = exportConfig.types;

    // Skip if not pointing to types/ directory
    if (!oldTypesPath.startsWith('./types/')) {
        continue;
    }

    const fileName = path.basename(oldTypesPath);
    let newTypesPath;

    // Main entry point gets renamed to index.d.ts
    if (fileName === mainTypesFile) {
        newTypesPath = './index.d.ts';
    } else {
        // Other files keep their names but move to root
        newTypesPath = `./${fileName}`;
    }

    exportConfig.types = newTypesPath;

    // Also update the default path to use the file basename (normalize path)
    if (exportConfig.default) {
        const defaultFileName = path.basename(exportConfig.default);
        exportConfig.default = `./fesm2022/${defaultFileName}`;
    }

    packageJsonModified = true;
    movedCount++;

    // Check if export path needs normalization (e.g., "./primitives/signals" -> "./primitives-signals")
    // This happens when the export path has slashes but the file uses dashes
    const fileBaseName = fileName.replace('.d.ts', ''); // e.g., 'primitives-signals.d.ts' -> 'primitives-signals'
    const exportPathClean = exportPath.replace(/^\.\//, ''); // remove leading ./
    const expectedExportPath = fileBaseName;

    if (exportPath !== '.' && exportPathClean !== expectedExportPath) {
        // Export path doesn't match file name, needs normalization
        const normalizedExportPath = `./${expectedExportPath}`;
        exportsToNormalize.push({
            oldPath: exportPath,
            newPath: normalizedExportPath,
            config: exportConfig
        });
        console.error(`  Will normalize export path: "${exportPath}" -> "${normalizedExportPath}"`);
    }

    console.error(`  Updated export "${exportPath}": ${oldTypesPath} -> ${newTypesPath}`);
}

// Apply export path normalizations
for (const { oldPath, newPath, config } of exportsToNormalize) {
    delete packageJson.exports[oldPath];
    packageJson.exports[newPath] = config;
    packageJsonModified = true;
    console.error(`  Renamed export path: "${oldPath}" -> "${newPath}"`);
}

// Write back package.json if modified
if (packageJsonModified) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.error(`  Updated package.json`);
}

console.error(`Successfully updated ${movedCount} export(s) for ${path.basename(packagePath)}`);
