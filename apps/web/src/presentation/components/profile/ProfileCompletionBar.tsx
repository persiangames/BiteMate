import { Link } from 'react-router-dom';
import { MIN_PROFILE_COMPLETION_FOR_ACTIONS } from '@bitemate/shared';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

export function ProfileCompletionBar() {
  const { user } = useAuth();
  const { t } = useI18n();

  if (!user) {
    return null;
  }

  const percent = user.profileCompletionPercent ?? 0;
  const complete = percent >= MIN_PROFILE_COMPLETION_FOR_ACTIONS;

  return (
    <div className={`profile-completion${complete ? ' profile-completion--done' : ''}`}>
      <div className="profile-completion__head">
        <strong>{t('profile.completion.title')}</strong>
        <span>{percent}%</span>
      </div>
      <div className="profile-completion__track" aria-hidden>
        <span className="profile-completion__fill" style={{ width: `${percent}%` }} />
      </div>
      {!complete ? (
        <p className="hint">
          {t('profile.completion.hint', { min: MIN_PROFILE_COMPLETION_FOR_ACTIONS })}
          {' '}
          <Link to="/profile/edit?highlight=1">{t('profile.completion.action')}</Link>
        </p>
      ) : (
        <p className="hint">{t('profile.completion.done')}</p>
      )}
    </div>
  );
}
