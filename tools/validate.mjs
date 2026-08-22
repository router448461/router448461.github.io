import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

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
if (!index.includes('og:image')) errors.push('Open Graph image metadata missing');
if (!fs.existsSync(path.join(root, '404.html'))) errors.push('404.html missing');
if (!fs.existsSync(path.join(root, 'og-image.svg'))) errors.push('og-image.svg missing');
if (!fs.existsSync(path.join(root, '.github/workflows/validate.yml'))) errors.push('Validation workflow missing');

if (errors.length) {
  console.error('Referral integrity check FAILED');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Referral integrity check PASSED');
console.log(`Verified ${required.length} referral cards, QR assets, codes, URLs and required scripts.`);
