import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to ngx-monaco-editor compiled files
const ngxPath = path.join(__dirname, '..', 'node_modules', 'ngx-monaco-editor');

console.error('Fixing standalone flags in ngx-monaco-editor...');

// Find all .js files in fesm2015 and esm2015 directories
const dirsToProcess = ['fesm2015', 'esm2015', 'fesm5', 'esm5'];

for (const dir of dirsToProcess) {
    const dirPath = path.join(ngxPath, dir);

    if (!fs.existsSync(dirPath)) {
        console.error(`  Skipping ${dir} (not found)`);
        continue;
    }

    // Process all .js files recursively
    processDirectory(dirPath, dir);
}

function processDirectory(dirPath, relativeName) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            processDirectory(fullPath, `${relativeName}/${entry.name}`);
        } else if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.endsWith('.__ivy_ngcc_bak')) {
            processFile(fullPath, `${relativeName}/${entry.name}`);
        }
    }
}

function processFile(filePath, relativePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // // Pattern 1: selector: 'ngx-monaco-editor' -> add standalone: false
    // // This handles ɵsetClassMetadata Component decorator args
    // This is handled by patching it in before hand, so it gets included in the .d.ts processing.
    // content = content.replace(
    //     /selector:\s*'ngx-monaco-(editor|diff-editor)'/g,
    //     (match) => {
    //         modified = true;
    //         return `${match}, standalone: false`;
    //     }
    // );

    // Pattern 2: selectors: [["ngx-monaco-editor"]] -> add standalone: false
    // This handles ɵɵdefineComponent format
    content = content.replace(
        /selectors:\s*\[\["ngx-monaco-(editor|diff-editor)"\]\]/g,
        (match) => {
            modified = true;
            return `${match}, standalone: false`;
        }
    );

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.error(`  Fixed ${relativePath}`);
    }
}

console.error('Done fixing standalone flags!');
