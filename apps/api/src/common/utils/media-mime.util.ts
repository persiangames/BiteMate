import { extname } from 'node:path';

const EXT_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.m4a': 'audio/mp4',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
};

/** Resolve a browser-safe Content-Type for a stored upload filename. */
export function contentTypeForUploadFilename(filename: string): string {
  const normalized = filename.toLowerCase();

  if (normalized.includes('chat_voice_') || normalized.includes('voice-')) {
    return 'audio/webm';
  }

  const ext = extname(filename).toLowerCase();
  if (EXT_TO_MIME[ext]) {
    return EXT_TO_MIME[ext];
  }

  return 'application/octet-stream';
}
