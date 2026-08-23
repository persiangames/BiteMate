import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { RestaurantDto, ReviewDto } from '@bitemate/shared';
import { formatPlace } from '@/data/localize';
import {
  createBooking,
  createReview,
  fetchRestaurant,
  fetchReviews,
} from '@/data/repositories/marketplaceRepository';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

export function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const { locale } = useI18n();
  const [restaurant, setRestaurant] = useState<RestaurantDto | null>(null);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('19:00');
  const [partySize, setPartySize] = useState(2);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken || !id) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [restaurantData, reviewsData] = await Promise.all([
          fetchRestaurant(accessToken!, id!),
          fetchReviews(accessToken!, { restaurantId: id! }),
        ]);
        setRestaurant(restaurantData);
        setReviews(reviewsData.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load restaurant');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [accessToken, id]);

  async function handleBooking(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !id) return;

    setMessage(null);
    setError(null);

    try {
      await createBooking(accessToken, {
        type: 'RESTAURANT_TABLE',
        restaurantId: id,
        bookingDate,
        bookingTime,
        partySize,
      });
      setMessage('Table booking submitted.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    }
  }

  async function handleReview(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !id) return;

    setMessage(null);
    setError(null);

    try {
      const review = await createReview(accessToken, {
        targetType: 'RESTAURANT',
        restaurantId: id,
        rating: reviewRating,
        text: reviewText || undefined,
      });
      setReviews((current) => [review, ...current]);
      setReviewText('');
      setMessage('Review posted.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review failed');
    }
  }

  if (loading) {
    return (
      <main className="page">
        <p className="hint">Loading restaurant…</p>
      </main>
    );
  }

  if (!restaurant) {
    return (
      <main className="page">
        <p className="error">{error ?? 'Restaurant not found'}</p>
        <Link to="/marketplace/restaurants">Back to restaurants</Link>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="panel flow">
        <div className="toolbar">
          <h1>{restaurant.name}</h1>
          <Link to="/marketplace/restaurants">Back</Link>
        </div>

        <p>{restaurant.description ?? 'No description yet.'}</p>
        <p>
          ★ {restaurant.averageRating.toFixed(1)} · {restaurant.reviewCount} reviews
        </p>
        <p className="hint">
          {restaurant.address ?? 'Address not listed'}
          {restaurant.city || restaurant.country
            ? ` · ${formatPlace(restaurant.city, restaurant.country, locale)}`
            : ''}
        </p>

        {restaurant.openingHours.length > 0 && (
          <div className="flow">
            <h2>Opening hours</h2>
            <ul className="plain-list">
              {restaurant.openingHours.map((hour) => (
                <li key={hour.dayOfWeek}>
                  {hour.dayOfWeek}:{' '}
                  {hour.isClosed ? 'Closed' : `${hour.openTime} – ${hour.closeTime}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {restaurant.menuItems.length > 0 && (
          <div className="flow">
            <h2>Menu</h2>
            <div className="card-list">
              {restaurant.menuItems.map((item) => (
                <article key={item.id} className="card">
                  <h3>{item.name}</h3>
                  <p>{item.description ?? '—'}</p>
                  <p>
                    {item.discountPercent > 0 ? (
                      <>
                        <s>{item.price.toFixed(2)}</s> {item.discountedPrice.toFixed(2)}{' '}
                        {item.currency} (-{item.discountPercent}%)
                      </>
                    ) : (
                      <>
                        {item.price.toFixed(2)} {item.currency}
                      </>
                    )}
                  </p>
                </article>
              ))}
            </div>
          </div>
        )}

        <form className="flow booking-form" onSubmit={handleBooking}>
          <h2>Book a table</h2>
          <label className="field">
            <span>Date</span>
            <input type="date" value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} required />
          </label>
          <label className="field">
            <span>Time</span>
            <input value={bookingTime} onChange={(event) => setBookingTime(event.target.value)} required />
          </label>
          <label className="field">
            <span>Party size</span>
            <input
              type="number"
              min={1}
              max={50}
              value={partySize}
              onChange={(event) => setPartySize(Number(event.target.value))}
              required
            />
          </label>
          <button type="submit">Book table</button>
        </form>

        <form className="flow" onSubmit={handleReview}>
          <h2>Write a review</h2>
          <label className="field">
            <span>Rating</span>
            <select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))}>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} stars
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Review</span>
            <input value={reviewText} onChange={(event) => setReviewText(event.target.value)} />
          </label>
          <button type="submit">Post review</button>
        </form>

        <div className="flow">
          <h2>Reviews</h2>
          {reviews.length === 0 && <p className="hint">No reviews yet.</p>}
          {reviews.map((review) => (
            <article key={review.id} className="card">
              <p>
                ★ {review.rating}
                {review.isVerifiedPurchase && ' · Verified purchase'}
              </p>
              <p>{review.text ?? '—'}</p>
              <p className="hint">
                {review.author.fullName ?? review.author.username ?? 'User'} ·{' '}
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </section>
    </main>
  );
}
