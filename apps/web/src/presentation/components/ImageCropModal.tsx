import { useEffect, useRef, useState } from 'react';
import { MediaSheet } from '@/presentation/components/MediaSheet';
import { useI18n } from '@/presentation/context/I18nContext';
import { coverScale, cropImageToFile, type CropAspect } from '@/utils/cropImage';

type ImageCropModalProps = {
  file: File;
  aspect: CropAspect;
  onCancel: () => void;
  onConfirm: (file: File) => void;
};

const OUTPUT: Record<CropAspect, { width: number; height: number; filename: string }> = {
  avatar: { width: 720, height: 720, filename: 'avatar.jpg' },
  cover: { width: 1500, height: 500, filename: 'cover.jpg' },
  post: { width: 1080, height: 1350, filename: 'post.jpg' },
};

export function ImageCropModal({ file, aspect, onCancel, onConfirm }: ImageCropModalProps) {
  const { t } = useI18n();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [frame, setFrame] = useState({ width: 240, height: 240 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setNatural({ width: 0, height: 0 });
    setError(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) {
      return undefined;
    }
    const apply = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width && rect.height) {
        setFrame({ width: rect.width, height: rect.height });
      }
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, [aspect, objectUrl]);

  const baseScale =
    natural.width && natural.height
      ? coverScale(natural.width, natural.height, frame.width, frame.height)
      : 1;

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    setDragging(true);
    lastPoint.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging || !lastPoint.current) {
      return;
    }
    const dx = event.clientX - lastPoint.current.x;
    const dy = event.clientY - lastPoint.current.y;
    lastPoint.current = { x: event.clientX, y: event.clientY };
    setOffset((current) => ({ x: current.x + dx, y: current.y + dy }));
  }

  function onPointerUp() {
    setDragging(false);
    lastPoint.current = null;
  }

  async function confirm() {
    const image = imageRef.current;
    if (!image || !natural.width) {
      setError(t('crop.wait'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const viewport = {
        width: Math.round(frame.width),
        height: Math.round(frame.height),
      };
      const output = OUTPUT[aspect];
      const cropped = await cropImageToFile(
        image,
        viewport,
        offset,
        zoom,
        output,
        output.filename,
      );
      onConfirm(cropped);
    } catch (err) {
      setError(err instanceof Error ? t('crop.failed') : t('crop.failed'));
      setBusy(false);
    }
  }

  const title =
    aspect === 'cover' ? t('crop.cover') : aspect === 'post' ? t('crop.photo') : t('crop.avatar');

  return (
    <MediaSheet title={title} hint={t('crop.hint')} onClose={onCancel}>
      <div
        ref={frameRef}
        className={`crop-frame crop-frame--${aspect}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {objectUrl ? (
          <img
            ref={imageRef}
            src={objectUrl}
            alt=""
            draggable={false}
            onLoad={(event) => {
              setNatural({
                width: event.currentTarget.naturalWidth,
                height: event.currentTarget.naturalHeight,
              });
            }}
            style={{
              width: natural.width ? `${natural.width * baseScale}px` : '100%',
              height: natural.height ? `${natural.height * baseScale}px` : '100%',
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            }}
          />
        ) : null}
      </div>
      <label className="field">
        <span>{t('crop.zoom')}</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
        />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <div className="crop-modal__actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={busy}>
          {t('crop.cancel')}
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={busy || !natural.width}
          onClick={() => void confirm()}
        >
          {busy ? t('save.saving') : t('crop.use')}
        </button>
      </div>
    </MediaSheet>
  );
}
