import { getAccessToken, refreshSessionTokens } from '@/data/api/sessionBridge';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api';

export type UploadProgressHandler = (percent: number) => void;

export type MediaUploadResult = {
  mediaUrl: string;
  thumbnailUrl: string | null;
  mediaType: 'IMAGE' | 'VIDEO';
};

function parseUploadResponse(xhr: XMLHttpRequest): MediaUploadResult {
  let body: unknown;
  try {
    body = JSON.parse(xhr.responseText);
  } catch {
    throw new Error('Upload failed');
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('mediaUrl' in body) ||
    typeof (body as { mediaUrl: unknown }).mediaUrl !== 'string'
  ) {
    throw new Error('Upload failed');
  }

  const record = body as MediaUploadResult;
  return {
    mediaUrl: record.mediaUrl,
    thumbnailUrl: record.thumbnailUrl ?? null,
    mediaType: record.mediaType,
  };
}

function xhrUpload(
  token: string,
  file: File,
  onProgress?: UploadProgressHandler,
  highQuality = false,
): Promise<{ status: number; result?: MediaUploadResult; message?: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const qualityParam = highQuality ? '?quality=high' : '';
    xhr.open('POST', `${API_BASE_URL}/media/upload${qualityParam}`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'text';

    xhr.upload.onprogress = (event) => {
      if (!onProgress) {
        return;
      }
      if (event.lengthComputable && event.total > 0) {
        onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve({ status: xhr.status, result: parseUploadResponse(xhr) });
          return;
        } catch (error) {
          reject(error);
          return;
        }
      }

      let message = 'Upload failed';
      try {
        const body = JSON.parse(xhr.responseText) as { message?: unknown };
        if (typeof body.message === 'string') {
          message = body.message;
        } else if (Array.isArray(body.message)) {
          message = body.message.filter((item): item is string => typeof item === 'string').join(' ');
        }
      } catch {
        // Keep default message.
      }
      resolve({ status: xhr.status, message });
    };

    xhr.onerror = () => reject(new Error('Upload failed. Check your connection.'));
    xhr.onabort = () => reject(new Error('Upload cancelled.'));

    const formData = new FormData();
    formData.append('file', file, file.name || `upload-${Date.now()}`);
    xhr.send(formData);
  });
}

export async function uploadMedia(
  accessToken: string,
  file: File,
  onProgress?: UploadProgressHandler,
  highQuality = false,
): Promise<MediaUploadResult> {
  let token = getAccessToken() ?? accessToken ?? '';
  let response = await xhrUpload(token, file, onProgress, highQuality);

  if (response.status === 401) {
    const next = await refreshSessionTokens(API_BASE_URL);
    if (next) {
      token = next;
      response = await xhrUpload(token, file, onProgress, highQuality);
    }
  }

  if (!response.result) {
    throw new Error(response.message ?? 'Upload failed');
  }

  return response.result;
}
