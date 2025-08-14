const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const projectRoot = path.join(__dirname, '..');
const srcRenderer = path.join(projectRoot, 'src', 'renderer');
const destRenderer = path.join(projectRoot, 'dist', 'renderer');

copyDir(srcRenderer, destRenderer);
console.log('Copied renderer files from', srcRenderer, 'to', destRenderer);
