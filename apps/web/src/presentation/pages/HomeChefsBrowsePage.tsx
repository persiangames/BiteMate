import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { HomeChefSummaryDto } from '@bitemate/shared';
import { apiFetch, authHeaders } from '@/data/api/client';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

export function HomeChefsBrowsePage() {
  const { accessToken, user } = useAuth();
  const { t } = useI18n();
  const [chefs, setChefs] = useState<HomeChefSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const items = await apiFetch<HomeChefSummaryDto[]>('/home-chefs', {
          headers: authHeaders(accessToken),
        });
        setChefs(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load home chefs');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [accessToken]);

  return (
    <main className="page">
      <section className="panel flow">
        <div className="toolbar">
          <h1>{t('filter.homechef')}</h1>
          <div className="toolbar-actions flow horizontal">
            <Link to="/marketplace/restaurants">Restaurants</Link>
            <Link to="/bookings">My bookings</Link>
          </div>
        </div>

        {user?.role === 'HOME_CHEF' && (
          <Link to="/marketplace/home-chef/dashboard">Manage my home chef profile</Link>
        )}

        {loading && <p className="hint">Loading home chefs…</p>}
        {error && <p className="error">{error}</p>}

        <div className="card-list">
          {chefs.map((chef) => (
            <Link key={chef.id} to={`/marketplace/home-chefs/${chef.id}`} className="card-link">
              <article className="card">
                <h2>{chef.chefName ?? chef.chefUsername ?? 'Home chef'}</h2>
                <p>{chef.bio ?? 'Local home-cooked meals'}</p>
                <p>
                  ★ {chef.averageRating.toFixed(1)} ({chef.reviewCount} reviews)
                </p>
                {chef.specialties.length > 0 && (
                  <p className="tags">{chef.specialties.join(' · ')}</p>
                )}
              </article>
            </Link>
          ))}
        </div>

        {!loading && chefs.length === 0 && <p className="hint">No home chefs listed yet.</p>}
      </section>
    </main>
  );
}
