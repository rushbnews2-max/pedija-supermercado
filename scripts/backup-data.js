import { copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dataDir = process.env.DATA_DIR || join(rootDir, 'server', 'data');
const source = join(dataDir, 'database.json');
const backupDir = join(rootDir, 'backups');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const target = join(backupDir, `database-${stamp}.json`);

if (!existsSync(source)) {
  console.error(`Banco nao encontrado em: ${source}`);
  process.exit(1);
}

await mkdir(backupDir, { recursive: true });
await copyFile(source, target);
console.log(`Backup criado: ${target}`);
