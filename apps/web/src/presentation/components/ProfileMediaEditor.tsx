import { useEffect, useRef, useState } from 'react';
import { uploadMedia } from '@/data/api/uploadClient';
import { AvatarStudio } from '@/presentation/components/AvatarStudio';
import { ImageCropModal } from '@/presentation/components/ImageCropModal';
import { useI18n } from '@/presentation/context/I18nContext';
import { localizeError } from '@/presentation/i18n/localizeError';
import { resolveMediaUrl, normalizeMediaUrlForStorage } from '@/utils/mediaUrl';

type ProfileMediaEditorProps = {
  accessToken: string;
  name: string;
  username: string;
  profileImage: string;
  coverImage: string;
  onChange: (next: { profileImage?: string; coverImage?: string }) => void;
};

type MediaKind = 'avatar' | 'cover';

function MediaEditMenu({
  label,
  hasMedia,
  disabled,
  onReplace,
  onDelete,
  replaceLabel,
  deleteLabel,
}: {
  label: string;
  hasMedia: boolean;
  disabled: boolean;
  onReplace: () => void;
  onDelete: () => void;
  replaceLabel: string;
  deleteLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    function handlePointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handlePointer);
    return () => document.removeEventListener('mousedown', handlePointer);
  }, [open]);

  return (
    <div className="media-edit-menu" ref={rootRef}>
      <button
        type="button"
        className="media-edit-menu__trigger"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {label}
      </button>
      {open ? (
        <div className="media-edit-menu__panel" role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onReplace();
            }}
          >
            {replaceLabel}
          </button>
          {hasMedia ? (
            <button
              type="button"
              role="menuitem"
              className="media-edit-menu__danger"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
            >
              {deleteLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function ProfileMediaEditor({
  accessToken,
  name,
  username,
  profileImage,
  coverImage,
  onChange,
}: ProfileMediaEditorProps) {
  const photoInput = useRef<HTMLInputElement | null>(null);
  const coverInput = useRef<HTMLInputElement | null>(null);
  const { t } = useI18n();
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropAspect, setCropAspect] = useState<'avatar' | 'cover'>('avatar');
  const [showStudio, setShowStudio] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const photoSrc = resolveMediaUrl(profileImage);
  const coverSrc = resolveMediaUrl(coverImage);
  const [photoBroken, setPhotoBroken] = useState(false);
  const [coverBroken, setCoverBroken] = useState(false);

  useEffect(() => {
    setPhotoBroken(false);
  }, [profileImage]);

  useEffect(() => {
    setCoverBroken(false);
  }, [coverImage]);

  function pickPhoto() {
    photoInput.current?.click();
  }

  function pickCover() {
    coverInput.current?.click();
  }

  function removeMedia(kind: MediaKind) {
    if (kind === 'cover') {
      onChange({ coverImage: '' });
    } else {
      onChange({ profileImage: '' });
    }
  }

  async function uploadCropped(file: File, kind: MediaKind) {
    const preview = URL.createObjectURL(file);
    if (kind === 'cover') {
      onChange({ coverImage: preview });
    } else {
      onChange({ profileImage: preview });
    }

    setUploading(true);
    setError(null);
    setCropFile(null);
    setShowStudio(false);
    try {
      const uploaded = await uploadMedia(accessToken, file, undefined, true);
      const storedUrl = normalizeMediaUrlForStorage(uploaded.mediaUrl);
      if (kind === 'cover') {
        onChange({ coverImage: storedUrl });
      } else {
        onChange({ profileImage: storedUrl });
      }
    } catch (err) {
      setError(localizeError(t, err, 'profile.upload.failed'));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="ig-profile-edit">
      <div className="ig-profile-edit__hero">
        <div className="ig-profile-edit__cover">
          {coverSrc && !coverBroken ? (
            <img src={coverSrc} alt="" onError={() => setCoverBroken(true)} />
          ) : (
            <div className="ig-profile-edit__cover-empty" />
          )}
          <MediaEditMenu
            label={coverSrc ? t('profile.cover.edit') : t('profile.cover.add')}
            hasMedia={Boolean(coverSrc)}
            disabled={uploading}
            replaceLabel={t('profile.media.replace')}
            deleteLabel={t('profile.media.delete')}
            onReplace={pickCover}
            onDelete={() => removeMedia('cover')}
          />
        </div>
        <div className="ig-profile-edit__avatar-wrap">
          <button type="button" className="ig-profile-edit__avatar" disabled={uploading}>
            {photoSrc && !photoBroken ? (
              <img src={photoSrc} alt={name} onError={() => setPhotoBroken(true)} />
            ) : (
              <span>{(name || username || 'BM').slice(0, 2).toUpperCase()}</span>
            )}
          </button>
          <MediaEditMenu
            label={t('profile.photo.edit')}
            hasMedia={Boolean(photoSrc)}
            disabled={uploading}
            replaceLabel={t('profile.media.replace')}
            deleteLabel={t('profile.media.delete')}
            onReplace={pickPhoto}
            onDelete={() => removeMedia('avatar')}
          />
        </div>
      </div>
      <div className="ig-profile-edit__photo-actions">
        <button type="button" className="btn-ghost" onClick={() => setShowStudio(true)} disabled={uploading}>
          {t('profile.photo.create')}
        </button>
      </div>
      {uploading ? <p className="hint">{t('profile.photo.saving')}</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <input
        ref={photoInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) {
            setCropAspect('avatar');
            setCropFile(file);
          }
        }}
      />
      <input
        ref={coverInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) {
            setCropAspect('cover');
            setCropFile(file);
          }
        }}
      />

      {cropFile ? (
        <ImageCropModal
          file={cropFile}
          aspect={cropAspect}
          onCancel={() => setCropFile(null)}
          onConfirm={(file) => void uploadCropped(file, cropAspect)}
        />
      ) : null}
      {showStudio ? (
        <AvatarStudio
          name={name}
          seed={username || name}
          onCancel={() => setShowStudio(false)}
          onConfirm={(file) => void uploadCropped(file, 'avatar')}
        />
      ) : null}
    </div>
  );
}
