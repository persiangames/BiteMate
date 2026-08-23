import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ProfileMeetupEventDto, PublicUserDto } from '@bitemate/shared';
import { fetchMeetupHistory, fetchPublicUser, fetchPublicUserById } from '@/data/repositories/profileRepository';
import { StarRating } from '@/presentation/components/ProfileSocialBar';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

export function MeetupHistoryPage() {
  const { username, userId, kind } = useParams<{
    username?: string;
    userId?: string;
    kind: 'hosted' | 'attended';
  }>();
  const { accessToken, user } = useAuth();
  const { t, locale } = useI18n();
  const [profile, setProfile] = useState<PublicUserDto | null>(null);
  const [items, setItems] = useState<ProfileMeetupEventDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const resolvedKind = kind === 'attended' ? 'attended' : 'hosted';

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    const load = username
      ? fetchPublicUser(accessToken, username)
      : userId
        ? fetchPublicUserById(accessToken, userId)
        : user
          ? fetchPublicUserById(accessToken, user.id)
          : Promise.reject(new Error('missing'));

    load
      .then(async (next) => {
        if (cancelled) return;
        setProfile(next);
        const history = await fetchMeetupHistory(accessToken, next.id, resolvedKind);
        if (!cancelled) setItems(history.items);
      })
      .catch(() => {
        if (!cancelled) setError(t('error.loadFailed'));
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, username, userId, resolvedKind, user, t]);

  if (error) {
    return <p className="error">{error}</p>;
  }
  if (!profile) {
    return <p className="hint">{t('common.loading')}</p>;
  }

  return (
    <div className="app-screen" lang={locale}>
      <header className="screen-header">
        <h1>
          {resolvedKind === 'hosted' ? t('profile.hostedEvents') : t('profile.attendedEvents')}
        </h1>
        <span className="hint">@{profile.username ?? profile.fullName}</span>
      </header>
      <div className="card-list">
        {items.map((event) => (
          <article key={event.id} className="glass-card flow">
            <div className="screen-header">
              <h2>{event.foodType}</h2>
              <StarRating value={event.rating} />
            </div>
            <p className="hint">
              {new Date(event.scheduledAt).toLocaleString()} · {t('profile.attendees', { count: event.attendeeCount })}
            </p>
            <p>
              {event.venueKind === 'RESTAURANT' && event.restaurantId ? (
                <Link to={`/marketplace/restaurants/${event.restaurantId}`} className="post-tag-link">
                  {event.restaurantName ?? event.locationLabel}
                </Link>
              ) : (
                <span className="location-badge">
                  {event.venueKind === 'HOME' ? t('profile.venueHome') : event.locationLabel ?? t('profile.venueOther')}
                </span>
              )}
            </p>
            <p className="hint">
              {event.role === 'HOST' ? t('profile.roleHost') : t('profile.roleGuest')}
              {event.reviewCount ? ` · ${t('profile.reviewCount', { count: event.reviewCount })}` : ''}
            </p>
          </article>
        ))}
      </div>
      {!items.length ? <p className="hint">{t('profile.eventsEmpty')}</p> : null}
    </div>
  );
}
