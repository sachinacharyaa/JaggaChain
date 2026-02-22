/**
 * One-time script: make the light gray background of nepal-map.png transparent
 * so the map blends with the page background. Run from frontend: node scripts/make-nepal-map-transparent.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PNG } = require('pngjs');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(__dirname, '..', 'public', 'nepal-map.png');
const outputPath = path.join(__dirname, '..', 'public', 'nepal-map.png');

// Treat pixels as "background gray" if R≈G≈B and luminance is in light-gray range
function isLightGray(r, g, b, a) {
  if (a < 128) return true;
  const avg = (r + g + b) / 3;
  const isGray = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b)) < 25;
  return isGray && avg >= 180 && avg <= 255;
}

const data = fs.readFileSync(inputPath);
const png = PNG.sync.read(data);

for (let y = 0; y < png.height; y++) {
  for (let x = 0; x < png.width; x++) {
    const i = (png.width * y + x) << 2;
    const r = png.data[i];
    const g = png.data[i + 1];
    const b = png.data[i + 2];
    const a = png.data[i + 3];
    if (isLightGray(r, g, b, a)) {
      png.data[i + 3] = 0;
    }
  }
}

fs.writeFileSync(outputPath, PNG.sync.write(png));
console.log('Done: nepal-map.png gray background made transparent.');
