/**
 * CI guard: fail when CJK appears in cleaned H5 surfaces (auth / orders / tickets / support).
 * Expand ROOTS as more pages are fully i18n'd.
 * Run: npm run scan:cjk
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = join(process.cwd(), 'apps/user-app/src');
const ROOTS = [
  'pages/login',
  'pages/register',
  'pages/reset-password',
  'pages/change-password',
  'pages/orders',
  'pages/info',
  'pages/tickets',
  'pages/support',
  'components/DialCodePicker.vue',
  'components/support',
  'utils/supportBus.ts',
];

const CJK = /[\u4e00-\u9fff]/;
const hits: { file: string; line: number; text: string }[] = [];

function walk(dir: string): void {
  const st = statSync(dir);
  if (st.isFile()) {
    scanFile(dir);
    return;
  }
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (/\.(vue|ts|tsx)$/.test(name)) scanFile(full);
  }
}

function scanFile(full: string): void {
  const rel = relative(SRC, full).replaceAll('\\', '/');
  const lines = readFileSync(full, 'utf8').split(/\r?\n/);
  lines.forEach((text, i) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('<!--')) return;
    if (CJK.test(text)) hits.push({ file: rel, line: i + 1, text: trimmed.slice(0, 140) });
  });
}

for (const root of ROOTS) walk(join(SRC, root));

if (hits.length) {
  console.error(`CJK residual scan failed: ${hits.length} hit(s)`);
  for (const h of hits.slice(0, 60)) console.error(`  ${h.file}:${h.line}  ${h.text}`);
  if (hits.length > 60) console.error(`  …and ${hits.length - 60} more`);
  process.exit(1);
}
console.log(`CJK residual scan passed (${ROOTS.length} roots, 0 hits)`);
