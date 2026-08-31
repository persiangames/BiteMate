import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MIN_PROFILE_COMPLETION_FOR_EVENTS } from '@bitemate/shared';
import type { MeetupDto } from '@bitemate/shared';
import { formatPlace, localizeDish, localizeFoodType } from '@/data/localize';
import {
  cancelMeetup,
  fetchMeetupById,
  requestMeetupJoin,
  updateMeetup,
} from '@/data/repositories/meetupRepository';
import { Avatar } from '@/presentation/components/Avatar';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';
import { localizeError } from '@/presentation/i18n/localizeError';
import { parseMeetupNotes } from '@/presentation/utils/meetupEventMeta';

export function MeetupDetailPage() {
  const { meetupId } = useParams<{ meetupId: string }>();
  const { accessToken, user } = useAuth();
  const { t, locale } = useI18n();
  const navigate = useNavigate();

  const [meetup, setMeetup] = useState<MeetupDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [locationDraft, setLocationDraft] = useState('');
  const [scheduledDraft, setScheduledDraft] = useState('');
  const [capacityDraft, setCapacityDraft] = useState(4);

  const isOwner = user?.id === meetup?.creator.id;

  const parsedNotes = useMemo(
    () => parseMeetupNotes(meetup?.notes),
    [meetup?.notes],
  );

  useEffect(() => {
    if (!accessToken || !meetupId) {
      return;
    }

    setLoading(true);
    setError(null);
    void fetchMeetupById(accessToken, meetupId)
      .then((item) => {
        setMeetup(item);
        const { description } = parseMeetupNotes(item.notes);
        setDescriptionDraft(description);
        setLocationDraft(item.locationLabel ?? '');
        setCapacityDraft(item.desiredPeople);
        setScheduledDraft(toLocalDateTimeInput(item.scheduledAt));
      })
      .catch((err) => setError(localizeError(t, err, 'error.loadFailed')))
      .finally(() => setLoading(false));
  }, [accessToken, meetupId, t]);

  async function handleJoin() {
    if (!accessToken || !meetup || meetup.isFull || isOwner) {
      return;
    }

    const completion = user?.profileCompletionPercent ?? 0;
    if (completion < MIN_PROFILE_COMPLETION_FOR_EVENTS) {
      setError(
        t('profile.completion.eventGateHint', {
          percent: completion,
          min: MIN_PROFILE_COMPLETION_FOR_EVENTS,
        }),
      );
      return;
    }

    setJoining(true);
    setError(null);
    try {
      const invite = await requestMeetupJoin(accessToken, { meetupId: meetup.id });
      setMessage(t('meetups.accepted'));
      if (invite.meetup.roomId) {
        navigate(`/meetups/room/${invite.meetup.roomId}`);
      }
    } catch (err) {
      setError(localizeError(t, err, 'error.generic'));
    } finally {
      setJoining(false);
    }
  }

  async function handleSave() {
    if (!accessToken || !meetup || !isOwner) {
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await updateMeetup(accessToken, meetup.id, {
        description: descriptionDraft,
        locationLabel: locationDraft,
        scheduledAt: scheduledDraft ? new Date(scheduledDraft).toISOString() : undefined,
        desiredPeople: capacityDraft,
      });
      setMeetup(updated);
      setEditing(false);
      setMessage(t('save.success'));
    } catch (err) {
      setError(localizeError(t, err, 'save.failed'));
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel() {
    if (!accessToken || !meetup || !isOwner) {
      return;
    }
    if (!window.confirm(t('event.cancelConfirm'))) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await cancelMeetup(accessToken, meetup.id);
      setMeetup(updated);
      setMessage(t('meetups.cancelled'));
      setEditing(false);
    } catch (err) {
      setError(localizeError(t, err, 'error.generic'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="app-screen">
        <p className="hint">{t('common.loading')}</p>
      </div>
    );
  }

  if (!meetup) {
    return (
      <div className="app-screen flow">
        <p className="error">{error ?? t('error.loadFailed')}</p>
        <Link to="/discover" className="btn-secondary">
          {t('nav.nearby')}
        </Link>
      </div>
    );
  }

  const creatorName = meetup.creator.fullName ?? meetup.creator.username ?? t('post.user');
  const canJoin =
    !isOwner &&
    !meetup.isFull &&
    meetup.status !== 'CANCELLED' &&
    meetup.status !== 'EXPIRED';

  return (
    <div className="app-screen meetup-detail flow">
      <section className="glass-card flow">
        <div className="meetup-detail__creator">
          <Avatar name={creatorName} imageUrl={meetup.creator.profileImage} />
          <div>
            {meetup.creator.username ? (
              <Link to={`/u/${meetup.creator.username}`}>
                <strong>{creatorName}</strong>
              </Link>
            ) : (
              <strong>{creatorName}</strong>
            )}
            <p className="hint">
              {t('nearby.rating', {
                rating: meetup.creator.meetupRating.toFixed(1),
                count: meetup.creator.meetupReviewCount,
              })}
            </p>
          </div>
        </div>

        <h1>{meetup.foodName ? localizeDish(meetup.foodName, locale) : localizeFoodType(meetup.foodType, locale)}</h1>
        <p className="hint">
          {meetup.mealSlot ? `${t(`dining.meal.${meetup.mealSlot}`)} · ` : ''}
          {new Date(meetup.scheduledAt).toLocaleString()}
        </p>
        <p className="hint">
          {meetup.locationLabel ||
            formatPlace(meetup.city, meetup.country, locale) ||
            t('event.locationPending')}
        </p>

        {parsedNotes.description ? <p>{parsedNotes.description}</p> : null}

        <div className="chip-cloud">
          {meetup.preferredInterests.map((interest) => (
            <span key={interest} className="filter-chip active">
              {t(`profile.interest.${interest}`)}
            </span>
          ))}
        </div>

        <div className="meetup-card__row">
          {meetup.isFull ? (
            <span className="full-badge">{t('meetups.full')}</span>
          ) : (
            <span className="seats-badge">{t('meetups.seatsLeft', { count: meetup.seatsLeft })}</span>
          )}
          <span className="hint">
            {meetup.radiusKm} {t('nearby.km')} · {t('meetups.status', { status: meetup.status })}
          </span>
        </div>
      </section>

      {editing && isOwner ? (
        <section className="glass-card flow">
          <h2>{t('post.edit')}</h2>
          <label className="field">
            <span>{t('meetups.when')}</span>
            <input
              type="datetime-local"
              value={scheduledDraft}
              onChange={(event) => setScheduledDraft(event.target.value)}
            />
          </label>
          <label className="field">
            <span>{t('event.restaurantOrPlace')}</span>
            <input value={locationDraft} onChange={(event) => setLocationDraft(event.target.value)} />
          </label>
          <label className="field">
            <span>{t('meetups.capacity')}</span>
            <input
              type="number"
              min={2}
              max={20}
              value={capacityDraft}
              onChange={(event) => setCapacityDraft(Number(event.target.value))}
            />
          </label>
          <label className="field">
            <span>{t('event.description')}</span>
            <textarea
              rows={4}
              value={descriptionDraft}
              onChange={(event) => setDescriptionDraft(event.target.value)}
            />
          </label>
          <div className="meetup-card__row">
            <button type="button" className="btn-primary" disabled={saving} onClick={() => void handleSave()}>
              {saving ? t('save.saving') : t('post.saveCaption')}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>
              {t('common.cancel')}
            </button>
          </div>
        </section>
      ) : null}

      <div className="meetup-card__row">
        {canJoin ? (
          <button type="button" className="btn-primary" disabled={joining} onClick={() => void handleJoin()}>
            {joining ? t('common.loading') : t('meetups.join')}
          </button>
        ) : null}
        {isOwner && meetup.status !== 'CANCELLED' ? (
          <>
            <button type="button" className="btn-secondary" onClick={() => setEditing((value) => !value)}>
              {t('post.edit')}
            </button>
            <button type="button" className="btn-ghost" disabled={saving} onClick={() => void handleCancel()}>
              {t('common.cancel')}
            </button>
          </>
        ) : null}
      </div>

      {message ? <p className="save-success">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}

function toLocalDateTimeInput(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
