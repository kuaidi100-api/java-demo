const fs = require('fs');
const p = 'F:/100fen/DK100/java-demo/packages/ui-components/src/i18n/messages.ts';
let s = fs.readFileSync(p, 'utf8');

const blocks = [
  null, // zh-CN already patched
  {
    // zh-Hant
    after: "'brand.name': '木棉速遞'",
    insert: `,\n  'brand.logo': '木棉快遞',\n  'brand.enColA': 'MUMIAN',\n  'brand.enColB': 'EXPRESS'`,
  },
  {
    after: "'brand.name': 'Kapok Express'", // vi - first occurrence after zhHant
    insert: `,\n  'brand.logo': 'Kapok Express',\n  'brand.enColA': 'MUMIAN',\n  'brand.enColB': 'EXPRESS'`,
  },
];

// Safer: insert after each 'brand.name' line that is NOT already followed by brand.logo
const re = /('brand\.name':\s*'[^']*')(,?)/g;
let count = 0;
s = s.replace(re, (full, namePart, comma) => {
  count += 1;
  // Check if next non-space already has brand.logo — handled by looking ahead in original is hard in replace
  return full;
});

// Line-based approach
const lines = s.split('\n');
const out = [];
for (let i = 0; i < lines.length; i++) {
  out.push(lines[i]);
  const m = lines[i].match(/^(\s*)'brand\.name':\s*'([^']*)'(,?)\s*$/);
  if (!m) continue;
  const next = lines[i + 1] || '';
  if (next.includes("'brand.logo'")) continue;
  const indent = m[1];
  const name = m[2];
  const isZh = /木棉/.test(name);
  const logo = isZh ? (name.includes('遞') ? '木棉快遞' : '木棉快递') : name;
  // ensure brand.name line ends with comma
  if (!lines[i].trim().endsWith(',')) {
    out[out.length - 1] = lines[i].replace(/\s*$/, ',');
  }
  out.push(`${indent}'brand.logo': '${logo}',`);
  out.push(`${indent}'brand.enColA': 'MUMIAN',`);
  out.push(`${indent}'brand.enColB': 'EXPRESS',`);
}
fs.writeFileSync(p, out.join('\n'));
console.log('patched brand.logo into locales, lines=', out.length);
