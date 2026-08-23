import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { BookingDto } from '@bitemate/shared';
import { fetchMyBookings } from '@/data/repositories/marketplaceRepository';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

export function BookingsPage() {
  const { accessToken } = useAuth();
  const { t } = useI18n();
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchMyBookings(accessToken!);
        setBookings(response.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bookings');
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
          <h1>{t('bookings.title')}</h1>
          <div className="toolbar-actions flow horizontal">
            <Link to="/marketplace/restaurants">Restaurants</Link>
            <Link to="/marketplace/home-chefs">Home chefs</Link>
          </div>
        </div>

        {loading && <p className="hint">Loading bookings…</p>}
        {error && <p className="error">{error}</p>}

        {bookings.length === 0 && !loading && <p className="hint">No bookings yet.</p>}

        <div className="card-list">
          {bookings.map((booking) => (
            <article key={booking.id} className="card">
              <h2>
                {booking.type === 'RESTAURANT_TABLE'
                  ? booking.restaurantName ?? 'Restaurant table'
                  : booking.menuItemName ?? 'Home chef meal'}
              </h2>
              <p>
                {booking.bookingDate} at {booking.bookingTime}
              </p>
              <p>
                Status: <strong>{booking.status}</strong>
              </p>
              {booking.type === 'RESTAURANT_TABLE' && booking.partySize && (
                <p>Party size: {booking.partySize}</p>
              )}
              {booking.type === 'HOME_CHEF_MEAL' && (
                <p>
                  {booking.quantity} × {booking.totalPrice.toFixed(2)} {booking.currency}
                </p>
              )}
              {booking.notes && <p className="hint">{booking.notes}</p>}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
