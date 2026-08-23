import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { HomeChefProfileDto, ReviewDto } from '@bitemate/shared';
import {
  createBooking,
  createHomeChefMenuItem,
  createReview,
  fetchHomeChefProfile,
  fetchMyHomeChefProfile,
  fetchReviews,
  upsertHomeChefProfile,
} from '@/data/repositories/marketplaceRepository';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';
import { SaveFeedback } from '@/presentation/components/SaveFeedback';

export function HomeChefPage() {
  const { id } = useParams<{ id: string }>();
  const { accessToken, user } = useAuth();
  const { t } = useI18n();
  const isOwner = user?.role === 'HOME_CHEF' && !id;
  const [profile, setProfile] = useState<HomeChefProfileDto | null>(null);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [menuName, setMenuName] = useState('');
  const [menuPrice, setMenuPrice] = useState('12');
  const [menuDate, setMenuDate] = useState('');
  const [menuServings, setMenuServings] = useState(10);
  const [bookingTime, setBookingTime] = useState('18:00');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const profileData = id
          ? await fetchHomeChefProfile(accessToken!, id)
          : await fetchMyHomeChefProfile(accessToken!);
        setProfile(profileData);
        setBio(profileData.bio ?? '');
        setSpecialties(profileData.specialties.join(', '));

        const reviewsData = await fetchReviews(accessToken!, {
          homeChefProfileId: profileData.id,
        });
        setReviews(reviewsData.items);
      } catch (err) {
        if (isOwner) {
          setError(null);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load home chef');
        }
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [accessToken, id, isOwner]);

  async function handleProfileSetup(event: FormEvent) {
    event.preventDefault();
    if (!accessToken) return;

    setMessage(null);
    setError(null);

    try {
      const saved = await upsertHomeChefProfile(accessToken, {
        bio,
        specialties: specialties
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      });
      setProfile(saved);
      setMessage('saved');
    } catch (err) {
      setError(t('save.failed'));
    }
  }

  async function handleMenuCreate(event: FormEvent) {
    event.preventDefault();
    if (!accessToken) return;

    setMessage(null);
    setError(null);

    try {
      const item = await createHomeChefMenuItem(accessToken, {
        name: menuName,
        price: Number(menuPrice),
        availableDate: menuDate,
        servingsAvailable: menuServings,
      });
      setProfile((current) =>
        current
          ? { ...current, menuItems: [...current.menuItems, item] }
          : current,
      );
      setMenuName('');
      setMessage('Daily menu item added.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add menu item');
    }
  }

  async function handleMealBooking(menuItemId: string, availableDate: string) {
    if (!accessToken) return;

    setMessage(null);
    setError(null);

    try {
      await createBooking(accessToken, {
        type: 'HOME_CHEF_MEAL',
        homeChefMenuItemId: menuItemId,
        bookingDate: availableDate,
        bookingTime,
        quantity: 1,
      });
      setMessage('Meal booking submitted.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    }
  }

  async function handleReview(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !profile) return;

    setMessage(null);
    setError(null);

    try {
      const review = await createReview(accessToken, {
        targetType: 'HOME_CHEF',
        homeChefProfileId: profile.id,
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
        <p className="hint">Loading home chef…</p>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="panel flow">
        <div className="toolbar">
          <h1>{profile ? profile.chefName ?? 'Home chef' : 'Home chef setup'}</h1>
          <div className="toolbar-actions flow horizontal">
            <Link to="/marketplace/restaurants">Restaurants</Link>
            <Link to="/bookings">My bookings</Link>
          </div>
        </div>

        {isOwner && !profile && (
          <form className="flow" onSubmit={handleProfileSetup}>
            <h2>Set up your home chef profile</h2>
            <label className="field">
              <span>Bio</span>
              <input value={bio} onChange={(event) => setBio(event.target.value)} />
            </label>
            <label className="field">
              <span>Specialties (comma separated)</span>
              <input value={specialties} onChange={(event) => setSpecialties(event.target.value)} />
            </label>
            <button type="submit" className="btn-primary">{t('chef.save')}</button>
          </form>
        )}

        {profile && (
          <>
            <p>{profile.bio ?? 'No bio yet.'}</p>
            <p>
              ★ {profile.averageRating.toFixed(1)} · {profile.reviewCount} reviews
            </p>
            {profile.specialties.length > 0 && (
              <p className="tags">{profile.specialties.join(' · ')}</p>
            )}

            {profile.availability.length > 0 && (
              <div className="flow">
                <h2>Availability</h2>
                <ul className="plain-list">
                  {profile.availability.map((slot) => (
                    <li key={slot.dayOfWeek}>
                      {slot.dayOfWeek}: {slot.startTime} – {slot.endTime}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flow">
              <h2>Daily menu</h2>
              {profile.menuItems.length === 0 && <p className="hint">No dishes listed yet.</p>}
              {profile.menuItems.map((item) => (
                <article key={item.id} className="card">
                  <h3>{item.name}</h3>
                  <p>
                    {item.price.toFixed(2)} {item.currency} · {item.availableDate}
                  </p>
                  <p className="hint">
                    {item.servingsRemaining} of {item.servingsAvailable} servings left
                  </p>
                  {!isOwner && item.servingsRemaining > 0 && (
                    <div className="flow horizontal">
                      <input value={bookingTime} onChange={(event) => setBookingTime(event.target.value)} />
                      <button type="button" onClick={() => handleMealBooking(item.id, item.availableDate)}>
                        Book meal
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>

            {isOwner && (
              <form className="flow" onSubmit={handleMenuCreate}>
                <h2>Add daily dish</h2>
                <label className="field">
                  <span>Dish name</span>
                  <input value={menuName} onChange={(event) => setMenuName(event.target.value)} required />
                </label>
                <label className="field">
                  <span>Price</span>
                  <input value={menuPrice} onChange={(event) => setMenuPrice(event.target.value)} required />
                </label>
                <label className="field">
                  <span>Available date</span>
                  <input type="date" value={menuDate} onChange={(event) => setMenuDate(event.target.value)} required />
                </label>
                <label className="field">
                  <span>Servings</span>
                  <input
                    type="number"
                    min={1}
                    value={menuServings}
                    onChange={(event) => setMenuServings(Number(event.target.value))}
                    required
                  />
                </label>
                <button type="submit">Add to menu</button>
              </form>
            )}

            {!isOwner && (
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
            )}

            <div className="flow">
              <h2>Reviews</h2>
              {reviews.map((review) => (
                <article key={review.id} className="card">
                  <p>
                    ★ {review.rating}
                    {review.isVerifiedPurchase && ' · Verified purchase'}
                  </p>
                  <p>{review.text ?? '—'}</p>
                </article>
              ))}
            </div>
          </>
        )}

        <SaveFeedback
          saved={Boolean(message)}
          error={error}
          successKey={message === 'saved' ? 'chef.saved' : 'save.success'}
        />
      </section>
    </main>
  );
}
