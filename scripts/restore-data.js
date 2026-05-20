import { copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const backupFile = process.argv[2];

if (!backupFile) {
  console.error('Informe o arquivo de backup: npm run restore -- ./backups/database.json');
  process.exit(1);
}

const source = resolve(rootDir, backupFile);
const dataDir = process.env.DATA_DIR || join(rootDir, 'server', 'data');
const target = join(dataDir, 'database.json');

if (!existsSync(source)) {
  console.error(`Backup nao encontrado: ${source}`);
  process.exit(1);
}

await mkdir(dataDir, { recursive: true });
await copyFile(source, target);
console.log(`Backup restaurado em: ${target}`);
