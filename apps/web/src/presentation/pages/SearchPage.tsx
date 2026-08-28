import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from '@/presentation/components/Avatar';
import { searchUsers } from '@/data/repositories/profileRepository';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';
import type { UserRole } from '@bitemate/shared';

export function SearchPage() {
  const { accessToken } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchUsers>>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const trimmed = query.trim().replace(/^@/, '');
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(() => {
      void searchUsers(accessToken, trimmed)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [accessToken, query]);

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
        <h1>{t('search.title')}</h1>
        <form className="search-page__form" onSubmit={handleSubmit}>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('search.placeholder')}
            autoComplete="off"
            spellCheck={false}
          />
        </form>

        {loading ? <p className="hint">{t('search.loading')}</p> : null}
        {!loading && query.trim().length >= 2 && results.length === 0 ? (
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
