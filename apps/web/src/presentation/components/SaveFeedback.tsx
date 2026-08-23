import { useI18n } from '@/presentation/context/I18nContext';

type SaveFeedbackProps = {
  saved: boolean;
  error: string | null;
  successKey?: string;
};

export function SaveFeedback({
  saved,
  error,
  successKey = 'save.success',
}: SaveFeedbackProps) {
  const { t } = useI18n();

  if (error) {
    return (
      <p className="error" role="alert">
        {error}
      </p>
    );
  }

  if (saved) {
    return (
      <p className="save-success" role="status">
        {t(successKey)}
      </p>
    );
  }

  return null;
}
