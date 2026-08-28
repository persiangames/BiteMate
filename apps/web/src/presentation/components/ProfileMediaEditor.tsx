import { useRef, useState } from 'react';
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

  function pickPhoto() {
    photoInput.current?.click();
  }

  function pickCover() {
    coverInput.current?.click();
  }

  async function uploadCropped(file: File, kind: 'avatar' | 'cover') {
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
      const uploaded = await uploadMedia(accessToken, file);
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
          {coverSrc ? <img src={coverSrc} alt="" /> : <div className="ig-profile-edit__cover-empty" />}
          <button type="button" className="ig-profile-edit__cover-btn" onClick={pickCover} disabled={uploading}>
            {coverSrc ? t('profile.cover.edit') : t('profile.cover.add')}
          </button>
        </div>
        <button type="button" className="ig-profile-edit__avatar" onClick={pickPhoto} disabled={uploading}>
          {photoSrc ? (
            <img src={photoSrc} alt={name} />
          ) : (
            <span>{(name || username || 'BM').slice(0, 2).toUpperCase()}</span>
          )}
        </button>
      </div>
      <div className="ig-profile-edit__photo-actions">
        <button type="button" className="btn-ghost" onClick={pickPhoto} disabled={uploading}>
          {t('profile.photo.change')}
        </button>
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
