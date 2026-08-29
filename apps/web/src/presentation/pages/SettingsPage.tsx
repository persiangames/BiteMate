import { Link } from 'react-router-dom';
import { DeleteAccountSection } from '@/presentation/components/settings/DeleteAccountSection';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';
import { useSound } from '@/presentation/context/SoundContext';
import { useTheme } from '@/presentation/context/ThemeContext';

export function SettingsPage() {
  const { logout } = useAuth();
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const { soundEnabled, setSoundEnabled } = useSound();

  return (
    <main className="page">
      <section className="panel flow">
        <h1>{t('settings.title')}</h1>

        <div className="settings-card flow">
          <label className={`settings-row settings-row--toggle settings-row--sound${soundEnabled ? ' is-on' : ' is-off'}`}>
            <span>{t('settings.sound')}</span>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(event) => setSoundEnabled(event.target.checked)}
            />
          </label>

          <div className="field">
            <span>{t('settings.appearance')}</span>
            <div className="filter-row">
              <button
                type="button"
                className={`filter-chip${theme === 'light' ? ' active' : ''}`}
                onClick={() => setTheme('light')}
              >
                {t('settings.theme.light')}
              </button>
              <button
                type="button"
                className={`filter-chip${theme === 'dark' ? ' active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                {t('settings.theme.dark')}
              </button>
            </div>
          </div>

          <Link to="/profile/edit" className="settings-row">
            <strong>{t('settings.profile')}</strong>
            <span className="hint">{t('profile.edit')}</span>
          </Link>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => logout().then(() => { window.location.href = '/login'; })}
          >
            {t('profile.logout')}
          </button>

          <DeleteAccountSection />
        </div>
      </section>
    </main>
  );
}
