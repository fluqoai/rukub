// Bulk rename: rukub.sa → rukub.shop
// Also: rukup.store → rukub.shop (defensive cleanup)
const fs = require('fs');
const path = require('path');

const ROOT = 'C:\\Users\\khayrat\\Desktop\\MyProjects\\dropshoping';
const SKIP_DIRS = new Set(['.next', 'node_modules', '.git']);
const VALID_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.md', '.txt', '.env.local', '.json', '.sql', '.svg', '.xml']);

let changed = 0;
let scanned = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.next') || entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else {
      const ext = path.extname(entry.name);
      if (!VALID_EXT.has(ext) && entry.name !== '.env.local') continue;
      scanned++;
      let content;
      try { content = fs.readFileSync(full, 'utf8'); } catch (e) { continue; }
      let updated = content;
      updated = updated.replaceAll('rukub.sa', 'rukub.shop');
      updated = updated.replaceAll('rukup.store', 'rukub.shop');
      updated = updated.replaceAll('RUKUB.SA', 'RUKUB.SHOP');
      updated = updated.replaceAll('RUKUB.Sa', 'RUKUB.Shop');
      if (updated !== content) {
        fs.writeFileSync(full, updated, 'utf8');
        changed++;
        console.log('updated:', full.replace(ROOT, ''));
      }
    }
  }
}

walk(ROOT);
console.log(`\nScanned: ${scanned} files`);
console.log(`Changed: ${changed} files`);
