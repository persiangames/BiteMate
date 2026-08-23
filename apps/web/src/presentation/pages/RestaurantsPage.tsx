import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { RestaurantSummaryDto } from '@bitemate/shared';
import { formatPlace, localizeFoodType } from '@/data/localize';
import { fetchRestaurants } from '@/data/repositories/marketplaceRepository';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

export function RestaurantsPage() {
  const { accessToken } = useAuth();
  const { t, locale } = useI18n();
  const [restaurants, setRestaurants] = useState<RestaurantSummaryDto[]>([]);
  const [search, setSearch] = useState('');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRestaurants = useCallback(
    async (nextCursor?: string | null, append = false) => {
      if (!accessToken) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetchRestaurants(accessToken, {
          search: search.trim() || undefined,
          cursor: nextCursor ?? undefined,
        });
        setRestaurants((current) =>
          append ? [...current, ...response.items] : response.items,
        );
        setCursor(response.nextCursor);
        setHasMore(response.hasMore);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load restaurants');
      } finally {
        setLoading(false);
      }
    },
    [accessToken, search],
  );

  useEffect(() => {
    void loadRestaurants();
  }, [loadRestaurants]);

  return (
    <main className="page">
      <section className="panel flow">
        <div className="toolbar">
          <h1>{t('restaurants.title')}</h1>
          <div className="toolbar-actions flow horizontal">
            <Link to="/marketplace/home-chefs">Home chefs</Link>
            <Link to="/bookings">My bookings</Link>
            <Link to="/feed">Feed</Link>
          </div>
        </div>

        <form
          className="flow horizontal"
          onSubmit={(event) => {
            event.preventDefault();
            void loadRestaurants();
          }}
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search restaurants…"
          />
          <button type="submit">Search</button>
        </form>

        <Link to="/marketplace/restaurants/create">Create restaurant (owners)</Link>

        {loading && restaurants.length === 0 && <p className="hint">Loading…</p>}
        {error && <p className="error">{error}</p>}

        <div className="card-list">
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              to={`/marketplace/restaurants/${restaurant.id}`}
              className="card-link"
            >
              <article className="card">
                <h2>{restaurant.name}</h2>
                <p className="hint">
                  {restaurant.city || restaurant.country
                    ? formatPlace(restaurant.city, restaurant.country, locale)
                    : t('profile.global')}
                </p>
                <p>
                  ★ {restaurant.averageRating.toFixed(1)} ({restaurant.reviewCount} reviews)
                </p>
                {restaurant.cuisineTypes.length > 0 && (
                  <p className="tags">
                    {restaurant.cuisineTypes.map((item) => localizeFoodType(item, locale)).join(' · ')}
                  </p>
                )}
              </article>
            </Link>
          ))}
        </div>

        {hasMore && (
          <button type="button" disabled={loading} onClick={() => loadRestaurants(cursor, true)}>
            {loading ? 'Loading…' : 'Load more'}
          </button>
        )}
      </section>
    </main>
  );
}
