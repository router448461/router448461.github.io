import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const headers = fs.readFileSync(path.join(root, '_headers'), 'utf8');

const required = [
  ['BINANCE', 'CPA_00JMQBCCFX', 'qr/binance.png', 'https://www.binance.com/activity/referral-entry/CPA?ref=CPA_00JMQBCCFX&utm_medium=app_share_link_sms'],
  ['COINBASE', 'U8A8YSA', 'qr/coinbase.png', 'https://coinbase.com/join/U8A8YSA'],
  ['COINBASE ADVANCED', 'TUW326E', 'qr/coinbase-advanced.png', 'https://advanced.coinbase.com/join/TUW326E'],
  ['CRYPTO.COM', 'unr50dyp0c', 'qr/crypto-com.png', 'https://crypto.com/app/unr50dyp0c'],
  ['STARLINK', 'RC-DF-11964990-93738-15', 'qr/starlink.svg', 'https://starlink.com/?referral=RC-DF-11964990-93738-15&app_source=share']
];

const errors = [];

for (const [name, code, asset, url] of required) {
  if (!index.includes(`>${name}<`)) errors.push(`Missing card name: ${name}`);
  if (!index.includes(`data-code="${code}"`)) errors.push(`Missing referral code: ${code}`);
  if (!index.includes(`src="${asset}"`)) errors.push(`Missing QR asset reference: ${asset}`);
  if (!index.includes(url)) errors.push(`Missing referral URL for ${name}`);
  if (!fs.existsSync(path.join(root, asset))) errors.push(`QR asset does not exist: ${asset}`);
}

for (const script of ['background.js', 'copy.js']) {
  if (!index.includes(`src="/${script}"`)) errors.push(`${script} is not loaded externally`);
  if (!fs.existsSync(path.join(root, script))) errors.push(`${script} missing`);
}

if (/<script(?![^>]*\bsrc=)[^>]*>/.test(index)) errors.push('Inline script detected in index.html');
if (/navigator\.serviceWorker|serviceWorker\.register\s*\(/.test(index)) errors.push('Unexpected service worker registration in index.html');
if (/unsafe-eval/.test(headers)) errors.push('Unsafe-eval detected in security headers');
if (!headers.includes('Content-Security-Policy:')) errors.push('Content-Security-Policy header missing');
if (!headers.includes("object-src 'none'")) errors.push('CSP object-src protection missing');
if (!headers.includes("base-uri 'none'")) errors.push('CSP base-uri protection missing');
if (!headers.includes("script-src-attr 'none'")) errors.push('CSP inline event-handler protection missing');
if (!headers.includes("style-src-attr 'none'")) errors.push('CSP inline style-attribute protection missing');
if (!headers.includes('Strict-Transport-Security:')) errors.push('HSTS header missing');
if (!headers.includes('X-Content-Type-Options: nosniff')) errors.push('nosniff header missing');
if (!headers.includes('X-Frame-Options: DENY')) errors.push('frame protection header missing');
if (!headers.includes('Referrer-Policy: strict-origin-when-cross-origin')) errors.push('Referrer-Policy missing');
if (!headers.includes('Cross-Origin-Opener-Policy: same-origin')) errors.push('COOP header missing');
if (!headers.includes('Cross-Origin-Resource-Policy: same-origin')) errors.push('CORP header missing');
if (!index.includes('og:image')) errors.push('Open Graph image metadata missing');
if (!fs.existsSync(path.join(root, '404.html'))) errors.push('404.html missing');
if (!fs.existsSync(path.join(root, 'og-image.svg'))) errors.push('og-image.svg missing');
if (!fs.existsSync(path.join(root, '.github/workflows/validate.yml'))) errors.push('Validation workflow missing');

if (errors.length) {
  console.error('Referral integrity and security validation FAILED');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Referral integrity and security validation PASSED');
console.log(`Verified ${required.length} referral cards, QR assets, codes, URLs and required scripts.`);
console.log('Validated consolidated renderer: background.js + copy.js');
console.log('Validated hardened HTTP security headers and service-worker absence.');
