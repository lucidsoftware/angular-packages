#!/usr/bin/env node
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to ngcc in this directory's node_modules
const ngccPath = join(__dirname, 'node_modules', '.bin', 'ngcc');

console.error('Running ngcc from Angular 15...');

// Run ngcc with arguments passed from command line
const args = process.argv.slice(2);

const result = spawnSync(ngccPath, args, {
    stdio: 'inherit',
    cwd: join(__dirname, '..'), // Run in parent directory (angular-packages)
    shell: true
});

process.exit(result.status);
