export type CropAspect = 'avatar' | 'cover' | 'post';

export function coverScale(
  naturalWidth: number,
  naturalHeight: number,
  viewWidth: number,
  viewHeight: number,
) {
  return Math.max(viewWidth / naturalWidth, viewHeight / naturalHeight);
}

export function cropImageToFile(
  image: HTMLImageElement,
  viewport: { width: number; height: number },
  offset: { x: number; y: number },
  zoom: number,
  output: { width: number; height: number },
  filename: string,
): Promise<File> {
  const naturalWidth = image.naturalWidth;
  const naturalHeight = image.naturalHeight;
  if (!naturalWidth || !naturalHeight) {
    return Promise.reject(new Error('Photo is still loading. Try again in a moment.'));
  }

  const scale = coverScale(naturalWidth, naturalHeight, viewport.width, viewport.height) * zoom;
  const drawWidth = naturalWidth * scale;
  const drawHeight = naturalHeight * scale;
  const drawX = (viewport.width - drawWidth) / 2 + offset.x;
  const drawY = (viewport.height - drawHeight) / 2 + offset.y;

  const canvas = document.createElement('canvas');
  canvas.width = output.width;
  canvas.height = output.height;
  const context = canvas.getContext('2d');
  if (!context) {
    return Promise.reject(new Error('Could not crop image'));
  }

  const ratioX = output.width / viewport.width;
  const ratioY = output.height / viewport.height;
  context.fillStyle = '#111';
  context.fillRect(0, 0, output.width, output.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(
    image,
    drawX * ratioX,
    drawY * ratioY,
    drawWidth * ratioX,
    drawHeight * ratioY,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not crop image'));
          return;
        }
        resolve(new File([blob], filename, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.92,
    );
  });
}
