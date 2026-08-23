import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

export function BackButton() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();

  function goBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(isAuthenticated ? '/feed' : '/language');
  }

  return (
    <button type="button" className="back-btn" onClick={goBack} aria-label={t('common.back')}>
      <span className="back-btn__icon" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 19l-7-7 7-7"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>{t('common.back')}</span>
    </button>
  );
}
