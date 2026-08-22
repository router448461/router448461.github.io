import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const headers = fs.readFileSync(path.join(root, '_headers'), 'utf8');
const errorPage = fs.readFileSync(path.join(root, '404.html'), 'utf8');

const required = [
  ['BINANCE', 'CPA_00JMQBCCFX', 'qr/binance.png', 'https://www.binance.com/activity/referral-entry/CPA?ref=CPA_00JMQBCCFX&utm_medium=app_share_link_sms'],
  ['COINBASE', 'U8A8YSA', 'qr/coinbase.png', 'https://coinbase.com/join/U8A8YSA'],
  ['COINBASE ADVANCED', 'TUW326E', 'qr/coinbase-advanced.png', 'https://advanced.coinbase.com/join/TUW326E'],
  ['CRYPTO.COM', 'unr50dyp0c', 'qr/crypto-com.png', 'https://crypto.com/app/unr50dyp0c'],
  ['STARLINK', 'RC-DF-11964990-93738-15', 'qr/starlink.svg', 'https://starlink.com/?referral=RC-DF-11964990-93738-15&app_source=share']
];

const errors = [];

for (const [name, code, asset, url] of required) {
  if (!index.includes(name)) errors.push(`Missing card name: ${name}`);
  if (!index.includes(`data-code="${code}"`)) errors.push(`Missing referral code: ${code}`);
  if (!index.includes(`src="${asset}"`)) errors.push(`Missing QR asset reference: ${asset}`);
  if (!index.includes(url)) errors.push(`Missing referral URL for ${name}`);
  if (!fs.existsSync(path.join(root, asset))) errors.push(`QR asset does not exist: ${asset}`);
}

for (const script of ['background.js', 'copy.js']) {
  if (!index.includes(`src="/${script}"`)) errors.push(`${script} is not loaded externally`);
  if (!fs.existsSync(path.join(root, script))) errors.push(`${script} missing`);
}

if (!index.includes('<link rel="stylesheet" href="/style.css">')) errors.push('External stylesheet link missing');
if (!fs.existsSync(path.join(root, 'style.css'))) errors.push('style.css missing');
if (/<style\b/i.test(index)) errors.push('Inline style block detected in index.html');
if (/<script(?![^>]*\bsrc=)[^>]*>/i.test(index)) errors.push('Inline script detected in index.html');
if (/navigator\.serviceWorker|serviceWorker\.register\s*\(/i.test(index)) errors.push('Unexpected service worker registration in index.html');
if (/<style\b/i.test(errorPage)) errors.push('Inline style block detected in 404.html');
if (!errorPage.includes('<link rel="stylesheet" href="/404.css">')) errors.push('External 404 stylesheet link missing');
if (!fs.existsSync(path.join(root, '404.css'))) errors.push('404.css missing');

const idMatches = [...index.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const duplicateIds = idMatches.filter((id, i) => idMatches.indexOf(id) !== i);
if (duplicateIds.length) errors.push(`Duplicate HTML id detected: ${[...new Set(duplicateIds)].join(', ')}`);

if (!/<html\slang="[^"]+"/i.test(index)) errors.push('Document language is missing');
if (!/<meta\s+name="viewport"\s+content="[^"]+"/i.test(index)) errors.push('Viewport metadata is missing');
if (!/<h1\s+[^>]*id="directory-title"[^>]*>/i.test(index)) errors.push('Primary h1 is missing');
if (!/<ul\s+class="cards"/i.test(index)) errors.push('Provider collection should use an unordered list');
if ((index.match(/<li\s+class="card"/g) || []).length !== required.length) errors.push(`Expected ${required.length} provider list items`);
if (!/aria-live="polite"/i.test(index) || !/class="sr-status"/i.test(index)) errors.push('Accessible copy status region is missing');
if ((index.match(/<img\b[^>]*\balt="[^"]+"/gi) || []).length !== required.length) errors.push(`Expected ${required.length} QR images with alt text`);
if ((index.match(/<img\b[^>]*\bwidth="[^"]+"[^>]*\bheight="[^"]+"/gi) || []).length !== required.length) errors.push(`Expected dimensions on all ${required.length} QR images`);
if ((index.match(/<a\b[^>]*aria-label="[^"]+"/gi) || []).length !== required.length) errors.push(`Expected accessible names on all ${required.length} provider links`);
if ((index.match(/<button\b[^>]*aria-label="[^"]+"/gi) || []).length !== required.length) errors.push(`Expected accessible names on all ${required.length} copy buttons`);

for (const token of ['unsafe-inline', 'unsafe-eval']) {
  if (headers.includes(token)) errors.push(`Forbidden CSP token detected: ${token}`);
}

const requiredHeaders = [
  "default-src 'none'",
  'Content-Security-Policy:',
  "style-src 'self'",
  "style-src-elem 'self'",
  "style-src-attr 'none'",
  "script-src 'self'",
  "script-src-elem 'self'",
  "script-src-attr 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "child-src 'none'",
  "form-action 'none'",
  "worker-src 'none'",
  "manifest-src 'none'",
  'Strict-Transport-Security:',
  'X-Content-Type-Options: nosniff',
  'X-Frame-Options: DENY',
  'Referrer-Policy: strict-origin-when-cross-origin',
  'Cross-Origin-Opener-Policy: same-origin',
  'Cross-Origin-Resource-Policy: same-origin'
];

for (const token of requiredHeaders) {
  if (!headers.includes(token)) errors.push(`Required security header/token missing: ${token}`);
}

const cssRule = headers.match(/\/\*\.css[\s\S]*?(?=\n\/\*|\s*$)/)?.[0] ?? '';
const jsRule = headers.match(/\/\*\.js[\s\S]*?(?=\n\/\*|\s*$)/)?.[0] ?? '';
if (/\bimmutable\b/i.test(cssRule)) errors.push('Mutable CSS must not use immutable caching without content-hashed filenames');
if (/\bimmutable\b/i.test(jsRule)) errors.push('Mutable JavaScript must not use immutable caching without content-hashed filenames');

const forbiddenLegacyFiles = [
  'background-engine.js',
  'sw.js',
  'sw-kill.js',
  'social-preview.svg',
  'manifest.webmanifest',
  'CNAME'
];

for (const file of forbiddenLegacyFiles) {
  if (fs.existsSync(path.join(root, file))) errors.push(`Legacy/unused file still present: ${file}`);
}

if (!index.includes('og:image')) errors.push('Open Graph image metadata missing');
if (!fs.existsSync(path.join(root, '404.html'))) errors.push('404.html missing');
if (!fs.existsSync(path.join(root, 'og-image.svg'))) errors.push('og-image.svg missing');
if (!fs.existsSync(path.join(root, '.github/workflows/validate.yml'))) errors.push('Validation workflow missing');

if (errors.length) {
  console.error('Referral integrity, accessibility, hygiene and security validation FAILED');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Referral integrity, accessibility, hygiene and security validation PASSED');
console.log(`Verified ${required.length} referral cards, QR assets, URLs, scripts, accessibility controls and security controls.`);
console.log('Verified legacy/unused files are absent and mutable assets are not cached as immutable.');
