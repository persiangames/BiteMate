import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchRestaurantRankings,
  fetchUserRankings,
} from '@/data/repositories/growthRepository';
import { useI18n } from '@/presentation/context/I18nContext';

export function RankingsPage() {
  const { t } = useI18n();
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<Awaited<ReturnType<typeof fetchUserRankings>>['items']>(
    [],
  );
  const [restaurants, setRestaurants] = useState<
    Awaited<ReturnType<typeof fetchRestaurantRankings>>['items']
  >([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [userRankings, restaurantRankings] = await Promise.all([
          fetchUserRankings(city || undefined),
          fetchRestaurantRankings(city || undefined),
        ]);
        setUsers(userRankings.items);
        setRestaurants(restaurantRankings.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load rankings');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [city]);

  return (
    <main className="page">
      <section className="panel flow">
        <div className="toolbar">
          <h1>{t('rankings.title')}</h1>
          <div className="toolbar-actions flow horizontal">
            <Link to="/premium">Premium</Link>
            <Link to="/profile">Profile</Link>
          </div>
        </div>

        <label className="field">
          Filter by city
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Optional" />
        </label>

        {loading && <p className="hint">Loading rankings…</p>}
        {error && <p className="error">{error}</p>}

        {!loading && (
          <>
            <article className="card">
              <h2>Top users</h2>
              {users.length === 0 && <p className="hint">No ranked users yet.</p>}
              <ul className="card-list">
                {users.map((entry) => (
                  <li key={entry.userId} className="card">
                    <p>
                      #{entry.rank} {entry.fullName ?? entry.username ?? entry.userId}
                      {entry.isPremium ? ' · Premium' : ''}
                    </p>
                    <p>
                      Score {entry.rankScore.toFixed(1)} · {entry.successfulMeetups} meetups ·{' '}
                      {entry.meetupRating.toFixed(1)}★ ({entry.meetupReviewCount})
                    </p>
                  </li>
                ))}
              </ul>
            </article>

            <article className="card">
              <h2>Top restaurants</h2>
              {restaurants.length === 0 && <p className="hint">No ranked restaurants yet.</p>}
              <ul className="card-list">
                {restaurants.map((entry) => (
                  <li key={entry.restaurantId} className="card">
                    <p>
                      #{entry.rank}{' '}
                      <Link to={`/marketplace/restaurants/${entry.restaurantId}`}>
                        {entry.name}
                      </Link>
                      {entry.isSponsored ? ' · Sponsored' : ''}
                    </p>
                    <p>
                      Score {entry.rankScore.toFixed(1)} · {entry.averageRating.toFixed(1)}★ ·{' '}
                      {entry.visitCount} visits · {(entry.conversionRate * 100).toFixed(1)}%
                      conversion
                    </p>
                  </li>
                ))}
              </ul>
            </article>
          </>
        )}
      </section>
    </main>
  );
}
