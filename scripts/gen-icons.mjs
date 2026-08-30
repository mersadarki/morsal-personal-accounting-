import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

mkdirSync('public/icons', { recursive: true });

const sizes = [192, 512];
for (const size of sizes) {
  await sharp('scripts/icon-source.svg').resize(size, size).png().toFile(`public/icons/icon-${size}.png`);
}
// maskable icon: same art but with safe-zone padding (logo scaled down within a full-bleed background)
await sharp('scripts/icon-source.svg')
  .resize(410, 410)
  .extend({ top: 51, bottom: 51, left: 51, right: 51, background: '#1F3D34' })
  .png()
  .toFile('public/icons/icon-maskable-512.png');

await sharp('scripts/icon-source.svg').resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp('scripts/icon-source.svg').resize(32, 32).png().toFile('public/favicon-32.png');

console.log('icons generated');
