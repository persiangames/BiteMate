import { compressImageFile } from '@/utils/compressImage';

export const MAX_CLIP_SECONDS = 30;
export const MAX_VIDEO_BYTES = 48 * 1024 * 1024;

function readVideoMeta(file: File): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.src = url;
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      const width = video.videoWidth;
      const height = video.videoHeight;
      URL.revokeObjectURL(url);
      resolve({ duration, width, height });
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read this video. Try MP4 or a shorter clip.'));
    };
  });
}

export async function captureVideoPoster(file: File): Promise<File | null> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.src = url;
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error('Could not read this video.'));
    });
    video.currentTime = Math.min(0.2, (video.duration || 1) / 8);
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
    });
    const canvas = document.createElement('canvas');
    const max = 720;
    const scale = Math.min(1, max / Math.max(video.videoWidth, video.videoHeight || 1));
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) {
      return null;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.82);
    });
    if (!blob) {
      return null;
    }
    return new File([blob], 'poster.jpg', { type: 'image/jpeg' });
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function preparePostMedia(file: File): Promise<{
  file: File;
  mediaType: 'IMAGE' | 'VIDEO';
  poster?: File;
}> {
  if (file.type.startsWith('video/')) {
    const meta = await readVideoMeta(file);
    if (meta.duration > MAX_CLIP_SECONDS + 0.35) {
      throw new Error(`Clips must be ${MAX_CLIP_SECONDS} seconds or shorter.`);
    }
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error('Video is too large. Use a clip under 12 MB.');
    }
    const poster = (await captureVideoPoster(file)) ?? undefined;
    return { file, mediaType: 'VIDEO', poster };
  }

  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    throw new Error('Choose a photo or a short video.');
  }

  const compressed = await compressImageFile(file, 1400, 0.78);
  return { file: compressed, mediaType: 'IMAGE' };
}
