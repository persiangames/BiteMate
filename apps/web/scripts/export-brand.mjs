import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const SRC =
  'C:/Users/My_PC/.cursor/projects/d-BiteMate-BiteMateApp/assets/c__Users_My_PC_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_logo_2-85a02231-9668-45bc-a185-fa2ebb6c19bd.png';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const BRAND_DIR = path.join(ROOT, 'brand');
const LOCKUP_DIR = path.join(BRAND_DIR, 'lockup');
const ICON_DIR = path.join(BRAND_DIR, 'icon');
const WEB_PUBLIC = path.resolve('public/brand');
const ADMIN_PUBLIC = path.join(ROOT, 'apps/admin/public/brand');

const LOCKUP_SIZES = [128, 192, 256, 320, 512, 768, 1024];
const ICON_SIZES = [16, 24, 32, 48, 64, 96, 120, 128, 180, 192, 256, 512, 1024];

function knockOutCanvas(data, width, height) {
  const visited = Buffer.alloc(width * height);
  const stack = [];

  const isCanvas = (offset) => data[offset] + data[offset + 1] + data[offset + 2] <= 36;

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (visited[p]) return;
    if (!isCanvas(p * 4)) return;
    visited[p] = 1;
    stack.push(p);
  };

  for (let x = 0; x < width; x += 1) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    push(0, y);
    push(width - 1, y);
  }

  while (stack.length > 0) {
    const p = stack.pop();
    const x = p % width;
    const y = (p - x) / width;
    data[p * 4 + 3] = 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    if (data[i] + data[i + 1] + data[i + 2] <= 8) {
      data[i + 3] = 0;
    }
  }
}

function pinRegion(data, width, height, channels) {
  const limitY = Math.floor(height * 0.62);
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < limitY; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * channels;
      const visible = channels === 4 ? data[i + 3] > 16 : true;
      if (!visible) continue;
      if (data[i] + data[i + 1] + data[i + 2] <= 24) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.06);
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  return {
    left,
    top,
    width: Math.min(width - left, maxX - minX + 1 + pad * 2),
    height: Math.min(height - top, maxY - minY + 1 + pad * 2),
  };
}

async function writePng(buffer, dest) {
  await sharp(buffer).png({ compressionLevel: 9, force: true }).toFile(dest);
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const name of fs.readdirSync(from)) {
    const src = path.join(from, name);
    if (fs.statSync(src).isDirectory()) continue;
    fs.copyFileSync(src, path.join(to, name));
  }
}

async function main() {
  for (const dir of [BRAND_DIR, LOCKUP_DIR, ICON_DIR, WEB_PUBLIC, ADMIN_PUBLIC]) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.copyFileSync(SRC, path.join(BRAND_DIR, 'source-original.jpg'));

  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  knockOutCanvas(data, info.width, info.height);

  const transparent = await sharp(Buffer.from(data), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const masterPath = path.join(BRAND_DIR, 'BiteMate-logo.png');
  await writePng(transparent, masterPath);

  for (const size of LOCKUP_SIZES) {
    await sharp(transparent)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: sharp.kernel.lanczos3 })
      .png({ compressionLevel: 9 })
      .toFile(path.join(LOCKUP_DIR, `lockup-${size}.png`));
  }

  const crop = pinRegion(data, info.width, info.height, 4);
  const side = Math.max(crop.width, crop.height);
  const iconMaster = await sharp(transparent)
    .extract(crop)
    .extend({
      top: Math.floor((side - crop.height) / 2),
      bottom: Math.ceil((side - crop.height) / 2),
      left: Math.floor((side - crop.width) / 2),
      right: Math.ceil((side - crop.width) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toBuffer();

  await writePng(iconMaster, path.join(ICON_DIR, 'icon-master.png'));

  for (const size of ICON_SIZES) {
    await sharp(iconMaster)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: sharp.kernel.lanczos3 })
      .png({ compressionLevel: 9 })
      .toFile(path.join(ICON_DIR, `icon-${size}.png`));
  }

  fs.copyFileSync(path.join(ICON_DIR, 'icon-32.png'), path.join(BRAND_DIR, 'favicon-32.png'));
  fs.copyFileSync(path.join(ICON_DIR, 'icon-16.png'), path.join(BRAND_DIR, 'favicon-16.png'));
  fs.copyFileSync(masterPath, path.join(LOCKUP_DIR, 'lockup-master.png'));

  copyDir(LOCKUP_DIR, WEB_PUBLIC);
  copyDir(ICON_DIR, WEB_PUBLIC);
  fs.copyFileSync(path.join(BRAND_DIR, 'favicon-16.png'), path.join(WEB_PUBLIC, 'favicon-16.png'));
  fs.copyFileSync(path.join(BRAND_DIR, 'favicon-32.png'), path.join(WEB_PUBLIC, 'favicon-32.png'));
  fs.copyFileSync(masterPath, path.join(WEB_PUBLIC, 'BiteMate-logo.png'));

  copyDir(WEB_PUBLIC, ADMIN_PUBLIC);
  fs.copyFileSync(path.join(ICON_DIR, 'icon-180.png'), path.join(ROOT, 'apps/web/public/apple-touch-icon.png'));

  console.log(JSON.stringify({ crop, brand: BRAND_DIR }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
