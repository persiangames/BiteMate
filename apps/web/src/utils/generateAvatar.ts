const PALETTES = [
  ['#ff4b3e', '#ff8a00', '#111827'],
  ['#2563eb', '#22d3ee', '#0f172a'],
  ['#7c3aed', '#ec4899', '#1e1b4b'],
  ['#059669', '#84cc16', '#052e16'],
  ['#e11d48', '#f59e0b', '#1c1917'],
  ['#0ea5e9', '#a855f7', '#082f49'],
];

export const AVATAR_STYLES = ['initials', 'mosaic', 'rings', 'orbit'] as const;
export type AvatarStyle = (typeof AVATAR_STYLES)[number];

function hashSeed(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'BM';
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function generateAvatarFile(options: {
  seed: string;
  name: string;
  style: AvatarStyle;
}): Promise<File> {
  const size = 512;
  const hash = hashSeed(options.seed);
  const palette = PALETTES[hash % PALETTES.length]!;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) {
    return Promise.reject(new Error('Could not create avatar'));
  }

  const gradient = context.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, palette[0]!);
  gradient.addColorStop(1, palette[1]!);
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  if (options.style === 'mosaic') {
    const cell = size / 8;
    for (let row = 0; row < 8; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        const bit = (hash >> ((row * 8 + col) % 24)) & 1;
        context.fillStyle = bit ? `${palette[2]}cc` : 'rgba(255,255,255,0.18)';
        context.fillRect(col * cell + 6, row * cell + 6, cell - 12, cell - 12);
      }
    }
  }

  if (options.style === 'rings' || options.style === 'orbit') {
    context.strokeStyle = 'rgba(255,255,255,0.35)';
    context.lineWidth = 18;
    for (let ring = 1; ring <= 4; ring += 1) {
      context.beginPath();
      context.arc(size / 2, size / 2, ring * 48 + (hash % 20), 0, Math.PI * 2);
      context.stroke();
    }
    if (options.style === 'orbit') {
      context.fillStyle = '#fff';
      context.beginPath();
      context.arc(size / 2 + 140, size / 2 - 40, 28, 0, Math.PI * 2);
      context.fill();
    }
  }

  context.fillStyle = '#fff';
  context.font = '700 168px system-ui, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(initialsFromName(options.name || options.seed), size / 2, size / 2 + 8);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not create avatar'));
          return;
        }
        resolve(new File([blob], `avatar-${options.style}.jpg`, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.92,
    );
  });
}

export function avatarPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}
