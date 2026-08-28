import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * One-time local utility — run manually after replacing icon-mark.source.png:
 *   cd apps/web && node scripts/make-icon-transparent.mjs
 *
 * Not hooked into prebuild: icon-mark.png is committed; Render web has no sharp dependency.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'public/brand/icon-mark.png');
const SOURCE = path.join(ROOT, 'public/brand/icon-mark.source.png');

const LIGHT_THRESHOLD = 235;

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.warn('sharp not installed — skip (use committed public/brand/icon-mark.png)');
    process.exit(0);
  }

  if (!fs.existsSync(SOURCE)) {
    console.error(`Missing ${SOURCE}`);
    process.exit(1);
  }

  const { data, info } = await sharp(SOURCE)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const isLight = r >= LIGHT_THRESHOLD && g >= LIGHT_THRESHOLD && b >= LIGHT_THRESHOLD;
    const isNeutral = Math.abs(r - g) <= 8 && Math.abs(g - b) <= 8 && Math.abs(r - b) <= 8;
    if (isLight || (isNeutral && r >= 220)) {
      pixels[i + 3] = 0;
    }
  }

  await sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(OUTPUT);

  console.log('Transparent icon saved → public/brand/icon-mark.png');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
