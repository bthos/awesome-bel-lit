// Copies the generated corpus (../public, produced by `python build.py`) into
// web/public/data so Vite serves and ships it as static JSON.
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '../../public');
const dest = resolve(here, '../public/data');

if (!existsSync(resolve(src, 'metadata/index.json'))) {
  console.error('public/metadata/index.json not found. Run `python build.py` from the repo root first.');
  process.exit(1);
}

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log(`Synced ${src} -> ${dest}`);
