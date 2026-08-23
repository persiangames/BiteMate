import { useEffect, useMemo, useState } from 'react';
import { MediaSheet } from '@/presentation/components/MediaSheet';
import { useI18n } from '@/presentation/context/I18nContext';
import {
  AVATAR_STYLES,
  generateAvatarFile,
  type AvatarStyle,
} from '@/utils/generateAvatar';

type AvatarStudioProps = {
  name: string;
  seed: string;
  onCancel: () => void;
  onConfirm: (file: File) => void;
};

export function AvatarStudio({ name, seed, onCancel, onConfirm }: AvatarStudioProps) {
  const { t } = useI18n();
  const [style, setStyle] = useState<AvatarStyle>('initials');
  const [shuffle, setShuffle] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const currentSeed = useMemo(
    () => `${seed || name || 'bitemate'}-${shuffle}`,
    [name, seed, shuffle],
  );

  useEffect(() => {
    let revoked: string | null = null;
    void generateAvatarFile({ seed: currentSeed, name, style }).then((next) => {
      const url = URL.createObjectURL(next);
      revoked = url;
      setFile(next);
      setPreview((previous) => {
        if (previous) {
          URL.revokeObjectURL(previous);
        }
        return url;
      });
    });
    return () => {
      if (revoked) {
        URL.revokeObjectURL(revoked);
      }
    };
  }, [currentSeed, name, style]);

  return (
    <MediaSheet title={t('avatar.title')} hint={t('avatar.hint')} onClose={onCancel}>
      {preview ? <img src={preview} alt="" className="avatar-studio__preview" /> : null}
      <div className="avatar-studio__styles">
        {AVATAR_STYLES.map((item) => (
          <button
            key={item}
            type="button"
            className={`filter-chip${item === style ? ' active' : ''}`}
            onClick={() => setStyle(item)}
          >
            {t(`avatar.${item}`)}
          </button>
        ))}
      </div>
      <div className="crop-modal__actions">
        <button type="button" className="btn-secondary" onClick={() => setShuffle((value) => value + 1)}>
          {t('avatar.shuffle')}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          {t('common.cancel')}
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={!file}
          onClick={() => file && onConfirm(file)}
        >
          {t('avatar.use')}
        </button>
      </div>
    </MediaSheet>
  );
}
