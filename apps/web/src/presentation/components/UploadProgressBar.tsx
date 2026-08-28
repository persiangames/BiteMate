import { useI18n } from '@/presentation/context/I18nContext';

type UploadProgressBarProps = {
  percent: number;
  label?: string;
};

export function UploadProgressBar({ percent, label }: UploadProgressBarProps) {
  const { t } = useI18n();
  const safe = Math.max(0, Math.min(100, percent));

  return (
    <div className="upload-progress" role="progressbar" aria-valuenow={safe} aria-valuemin={0} aria-valuemax={100}>
      <div className="upload-progress__label">
        <span>{label ?? t('post.uploading')}</span>
        <strong>{safe}%</strong>
      </div>
      <div className="upload-progress__track">
        <div className="upload-progress__fill" style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}
