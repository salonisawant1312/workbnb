const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = process.cwd();
const frontendDir = path.join(rootDir, 'frontend');
const frontendDist = path.join(frontendDir, 'dist');
const rootDist = path.join(rootDir, 'dist');

execSync('npm ci', { cwd: frontendDir, stdio: 'inherit' });
execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

fs.rmSync(rootDist, { recursive: true, force: true });
fs.mkdirSync(rootDist, { recursive: true });
fs.cpSync(frontendDist, rootDist, { recursive: true });

console.log('Vercel root build complete. Output copied to /dist');
