import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from '@/presentation/components/Avatar';
import { searchUsers } from '@/data/repositories/profileRepository';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';
import type { UserRole } from '@bitemate/shared';

function normalizeUsernameInput(value: string): string {
  return value.trim().replace(/^@+/, '').replace(/\s+/g, '');
}

export function SearchPage() {
  const { accessToken } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchUsers>>>([]);
  const [loading, setLoading] = useState(false);

  const username = normalizeUsernameInput(query);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    if (username.length < 1) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(() => {
      void searchUsers(accessToken, `@${username}`)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [accessToken, username]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const hit = results[0];
    if (hit?.username) {
      navigate(`/u/${hit.username}`);
    }
  }

  return (
    <main className="page search-page">
      <section className="panel flow">
        <h1 className="visually-hidden">{t('nav.people')}</h1>
        <p className="hint">{t('search.hint')}</p>
        <form className="search-page__form" onSubmit={handleSubmit}>
          <label className="search-page__input-wrap">
            <span className="search-page__at" aria-hidden>
              @
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(normalizeUsernameInput(event.target.value))}
              placeholder={t('search.usernamePlaceholder')}
              autoComplete="off"
              spellCheck={false}
              inputMode="search"
              autoCapitalize="none"
              autoCorrect="off"
            />
          </label>
        </form>

        {loading ? <p className="hint">{t('search.loading')}</p> : null}
        {!loading && username.length >= 1 && results.length === 0 ? (
          <p className="hint">{t('search.empty')}</p>
        ) : null}

        <ul className="search-page__results">
          {results.map((user) => (
            <li key={user.id}>
              <Link to={user.username ? `/u/${user.username}` : '#'} className="search-page__hit">
                <Avatar name={user.fullName ?? user.username} imageUrl={user.profileImage} size="md" />
                <span className="search-page__meta">
                  <strong>{user.username ? `@${user.username}` : user.fullName}</strong>
                  <span>{user.fullName}</span>
                  {user.bio ? <span className="search-page__bio">{user.bio}</span> : null}
                  <span className="hint">
                    {t('search.followers', { count: user.followerCount })}
                    {user.role ? ` · ${t(`auth.role.${user.role as UserRole}`)}` : ''}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
