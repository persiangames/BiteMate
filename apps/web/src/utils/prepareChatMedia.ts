import { compressImageFile } from '@/utils/compressImage';

export const MAX_CHAT_VOICE_SECONDS = 120;
export const MAX_CHAT_VIDEO_SECONDS = 60;
export const MAX_CHAT_VIDEO_BYTES = 12 * 1024 * 1024;

function readVideoMeta(file: File): Promise<{ duration: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.src = url;
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      URL.revokeObjectURL(url);
      resolve({ duration });
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read this video.'));
    };
  });
}

export async function prepareChatMedia(
  file: File,
  type: 'IMAGE' | 'VIDEO' | 'VOICE' | 'FILE',
): Promise<{ file: File; durationSeconds?: number }> {
  if (type === 'VOICE') {
    const mime = file.type.startsWith('audio/') ? file.type : 'audio/webm';
    if (file.type === mime) {
      return { file };
    }
    return {
      file: new File([file], file.name.endsWith('.webm') ? file.name : `voice-${Date.now()}.webm`, {
        type: mime,
      }),
    };
  }

  if (type === 'FILE') {
    return { file };
  }

  if (type === 'VIDEO' || file.type.startsWith('video/')) {
    const meta = await readVideoMeta(file);
    if (meta.duration > MAX_CHAT_VIDEO_SECONDS + 0.35) {
      throw new Error(`Video messages must be ${MAX_CHAT_VIDEO_SECONDS} seconds or shorter.`);
    }
    if (file.size > MAX_CHAT_VIDEO_BYTES) {
      throw new Error('Video is too large for chat. Use a clip under 12 MB.');
    }
    return { file, durationSeconds: Math.max(1, Math.round(meta.duration)) };
  }

  if (file.type.startsWith('image/')) {
    const compressed = await compressImageFile(file, 1600, 0.88);
    return { file: compressed };
  }

  return { file };
}
