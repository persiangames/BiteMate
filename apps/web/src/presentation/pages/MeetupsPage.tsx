import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  EDUCATION_LEVELS,
  GENDERS,
  MEAL_SLOTS,
  MIN_PROFILE_COMPLETION_FOR_ACTIONS,
  type EducationLevel,
  type FoodIntentDto,
  type Gender,
  type IntentMatchDto,
  type MealSlot,
  type MeetupInviteDto,
} from '@bitemate/shared';
import {
  connectRealtime,
  disconnectRealtime,
  onMeetupInvite,
} from '@/data/api/socketClient';
import {
  cancelFoodIntent,
  createFoodIntent,
  fetchIntentDailyLimit,
  fetchIntentMatches,
  fetchMyIntents,
} from '@/data/repositories/intentRepository';
import {
  acceptMeetupInvite,
  fetchInviteLimit,
  fetchMyInvites,
  rejectMeetupInvite,
  sendMeetupInvite,
} from '@/data/repositories/meetupRepository';
import {
  citySelectOptions,
  countrySelectOptions,
  dishSelectOptions,
  dishSelectOptionsForFoodType,
  foodTypeSelectOptions,
  localizeFoodType,
} from '@/data/localize';
import { SearchableSelect } from '@/presentation/components/SearchableSelect';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

export function MeetupsPage() {
  const { accessToken, user } = useAuth();
  const { t, locale } = useI18n();
  const [searchParams] = useSearchParams();
  const inviteeId = searchParams.get('invitee');
  const [foodType, setFoodType] = useState('');
  const [foodName, setFoodName] = useState('');
  const [mealSlot, setMealSlot] = useState<MealSlot>('LUNCH');
  const [scheduledAt, setScheduledAt] = useState('');
  const [radiusKm, setRadiusKm] = useState(5);
  const [desiredPeople, setDesiredPeople] = useState(4);
  const [preferredGender, setPreferredGender] = useState<Gender | ''>('');
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(65);
  const [preferredEducation, setPreferredEducation] = useState<EducationLevel | ''>('');
  const [country, setCountry] = useState(user?.country ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [latitude, setLatitude] = useState<number | null>(user?.liveLatitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(user?.liveLongitude ?? null);
  const countryOptions = useMemo(() => countrySelectOptions(locale), [locale]);
  const cityOptions = useMemo(() => citySelectOptions(country, locale), [country, locale]);
  const cuisineOptions = useMemo(() => foodTypeSelectOptions(locale), [locale]);
  const dishOptions = useMemo(
    () => dishSelectOptionsForFoodType(foodType, locale),
    [foodType, locale],
  );

  const [myIntents, setMyIntents] = useState<FoodIntentDto[]>([]);
  const [activeIntent, setActiveIntent] = useState<FoodIntentDto | null>(null);
  const [matches, setMatches] = useState<IntentMatchDto[]>([]);
  const [invites, setInvites] = useState<MeetupInviteDto[]>([]);
  const [intentLimit, setIntentLimit] = useState('');
  const [inviteLimit, setInviteLimit] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!accessToken) return;

    try {
      const [intents, incoming, invitesQuota, intentQuota] = await Promise.all([
        fetchMyIntents(accessToken),
        fetchMyInvites(accessToken),
        fetchInviteLimit(accessToken),
        fetchIntentDailyLimit(accessToken),
      ]);
      setMyIntents(intents.items);
      setInvites(incoming.items);
      setInviteLimit(`${invitesQuota.usedToday}/${invitesQuota.dailyLimit} invites today`);
      setIntentLimit(`${intentQuota.activeCount}/${intentQuota.maxActive} active · ${intentQuota.usedToday}/${intentQuota.dailyLimit} created today`);
    } catch (err) {
      setError(err instanceof Error ? t('meetups.loadFailed') : t('meetups.loadFailed'));
    }
  }, [accessToken]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!accessToken) return;

    connectRealtime(accessToken);
    const unsubscribe = onMeetupInvite((invite) => {
      setInvites((current) => [invite, ...current.filter((item) => item.id !== invite.id)]);
      setMessage(`New invite: ${invite.meetup.foodType}`);
    });

    return () => {
      unsubscribe();
      disconnectRealtime();
    };
  }, [accessToken]);

  useEffect(() => {
    if (latitude !== null && longitude !== null) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, [latitude, longitude]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || latitude === null || longitude === null || profileLocked) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    const timeStart = new Date(scheduledAt);
    const timeEnd = new Date(timeStart.getTime() + 2 * 60 * 60 * 1000);

    try {
      const intent = await createFoodIntent(accessToken, {
        foodType,
        foodCategory: mealSlot.toLowerCase(),
        mealSlot,
        foodName: foodName || foodType,
        preferredGender: preferredGender || undefined,
        ageMin,
        ageMax,
        preferredEducation: preferredEducation || undefined,
        country: country || undefined,
        city: city || undefined,
        timeStart: timeStart.toISOString(),
        timeEnd: timeEnd.toISOString(),
        radiusKm,
        desiredPeople,
        latitude,
        longitude,
      });
      setActiveIntent(intent);
      setMyIntents((current) => [intent, ...current]);
      setMessage(t('save.success'));
      if (inviteeId && intent.meetupId) {
        await sendMeetupInvite(accessToken, { meetupId: intent.meetupId, inviteeId });
        setMessage(t('meetups.inviteSent'));
      }
      await loadMatches(intent.id);
      await loadData();
    } catch (err) {
      setError(t('error.generic'));
    } finally {
      setLoading(false);
    }
  }

  async function loadMatches(intentId: string) {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchIntentMatches(accessToken, intentId);
      setMatches(response.items);
    } catch (err) {
      setError(t('error.generic'));
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(intentId: string) {
    if (!accessToken) return;

    try {
      await cancelFoodIntent(accessToken, { intentId });
      setMyIntents((current) => current.filter((item) => item.id !== intentId));
      if (activeIntent?.id === intentId) {
        setActiveIntent(null);
        setMatches([]);
      }
      setMessage(t('meetups.cancelled'));
      await loadData();
    } catch (err) {
      setError(t('error.generic'));
    }
  }

  async function handleInvite(meetupId: string | null, inviteeId: string) {
    if (!accessToken || !meetupId) return;

    setMessage(null);
    setError(null);

    try {
      await sendMeetupInvite(accessToken, { meetupId, inviteeId });
      setMessage(t('meetups.inviteSent'));
      const limit = await fetchInviteLimit(accessToken);
      setInviteLimit(`${limit.usedToday}/${limit.dailyLimit} invites today`);
    } catch (err) {
      setError(t('error.generic'));
    }
  }

  async function handleAccept(inviteId: string) {
    if (!accessToken) return;

    try {
      const invite = await acceptMeetupInvite(accessToken, { inviteId });
      setInvites((current) => current.filter((item) => item.id !== inviteId));
      setMessage(t('meetups.accepted'));
      if (invite.meetup.roomId) {
        window.location.href = `/meetups/room/${invite.meetup.roomId}`;
      }
    } catch (err) {
      setError(t('error.generic'));
    }
  }

  async function handleReject(inviteId: string) {
    if (!accessToken) return;

    try {
      await rejectMeetupInvite(accessToken, { inviteId });
      setInvites((current) => current.filter((item) => item.id !== inviteId));
    } catch (err) {
      setError(t('error.generic'));
    }
  }

  const profileLocked =
    (user?.profileCompletionPercent ?? 0) < MIN_PROFILE_COMPLETION_FOR_ACTIONS;

  return (
    <div className="app-screen">
      <header className="screen-header">
        <h1>{t('meetups.title')}</h1>
      </header>

      {profileLocked ? (
        <section className="glass-card profile-gate">
          <h2>{t('profile.completion.gateTitle')}</h2>
          <p className="hint">
            {t('profile.completion.gateHint', {
              percent: user?.profileCompletionPercent ?? 0,
              min: MIN_PROFILE_COMPLETION_FOR_ACTIONS,
            })}
          </p>
          <Link to="/profile/edit" className="btn-primary">
            {t('profile.completion.action')}
          </Link>
        </section>
      ) : null}

      <section className={`glass-card flow${profileLocked ? ' is-disabled' : ''}`}>
        <p className="hint">
          Matching engine connects you by food preference, distance, time window, rating, and reliability.
        </p>
        <p className="hint">{intentLimit}</p>
        <p className="hint">{inviteLimit}</p>

        <form className="flow" onSubmit={handleCreate}>
          <h2>{t('meetups.create')}</h2>
          {inviteeId ? <p className="save-success">{t('meetups.inviteeReady')}</p> : null}
          <SearchableSelect
            label={t('dining.foodType')}
            value={foodType}
            options={cuisineOptions}
            placeholder={t('dining.foodTypeHint')}
            allowCustom
            onChange={(value) => {
              setFoodType(value);
              setFoodName('');
            }}
          />
          <SearchableSelect
            label={t('dining.foodName')}
            value={foodName}
            options={dishOptions}
            placeholder={
              foodType ? t('dining.foodNameHint') : t('dining.selectFoodTypeFirst')
            }
            allowCustom
            disabled={!foodType}
            onChange={setFoodName}
          />
          <label className="field">
            <span>{t('meetups.category')}</span>
            <select value={mealSlot} onChange={(event) => setMealSlot(event.target.value as MealSlot)}>
              {MEAL_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {t(`dining.meal.${slot}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t('meetups.when')}</span>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>{t('meetups.radius')}</span>
            <input
              type="number"
              min={1}
              max={50}
              value={radiusKm}
              onChange={(event) => setRadiusKm(Number(event.target.value))}
              required
            />
          </label>
          <label className="field">
            <span>{t('meetups.capacity')}</span>
            <input
              type="number"
              min={2}
              max={20}
              value={desiredPeople}
              onChange={(event) => setDesiredPeople(Number(event.target.value))}
              required
            />
          </label>
          <label className="field">
            <span>{t('dining.preferredGender')}</span>
            <select
              value={preferredGender}
              onChange={(event) => setPreferredGender(event.target.value as Gender | '')}
            >
              <option value="">{t('dining.any')}</option>
              {GENDERS.map((item) => (
                <option key={item} value={item}>
                  {t(`dining.gender.${item}`)}
                </option>
              ))}
            </select>
          </label>
          <div className="filter-grid">
            <label className="field">
              <span>{t('dining.ageMin')}</span>
              <input type="number" min={18} max={99} value={ageMin} onChange={(event) => setAgeMin(Number(event.target.value))} />
            </label>
            <label className="field">
              <span>{t('dining.ageMax')}</span>
              <input type="number" min={18} max={99} value={ageMax} onChange={(event) => setAgeMax(Number(event.target.value))} />
            </label>
          </div>
          <label className="field">
            <span>{t('dining.education')}</span>
            <select
              value={preferredEducation}
              onChange={(event) => setPreferredEducation(event.target.value as EducationLevel | '')}
            >
              <option value="">{t('dining.any')}</option>
              {EDUCATION_LEVELS.map((item) => (
                <option key={item} value={item}>
                  {t(`dining.education.${item}`)}
                </option>
              ))}
            </select>
          </label>
          <SearchableSelect
            label={t('profile.country')}
            value={country}
            options={countryOptions}
            placeholder={t('auth.searchHint')}
            onChange={(next) => {
              setCountry(next);
              setCity('');
            }}
          />
          <SearchableSelect
            label={t('profile.city')}
            value={city}
            options={cityOptions}
            placeholder={country ? t('auth.searchHint') : t('auth.selectCountryFirst')}
            disabled={!country}
            onChange={setCity}
          />
          <p className="hint">
            Location:{' '}
            {latitude !== null && longitude !== null
              ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
              : 'Detecting… enable location or update live location in profile'}
          </p>
          <button type="submit" className="btn-primary" disabled={loading || latitude === null || longitude === null}>
            {loading ? t('meetups.creating') : t('meetups.find')}
          </button>
        </form>
      </section>

      {myIntents.length > 0 && (
        <div className="flow">
          <h2>{t('meetups.mine')}</h2>
          {myIntents.map((intent) => (
            <article key={intent.id} className="glass-card meetup-card">
              <h3>{localizeFoodType(intent.foodType, locale)}</h3>
              <p>
                {new Date(intent.timeStart).toLocaleString()} · {intent.desiredPeople} people ·{' '}
                {intent.radiusKm} km
              </p>
              <p className="hint">Status: {intent.status}</p>
              <div className="meetup-card__row">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setActiveIntent(intent);
                    void loadMatches(intent.id);
                  }}
                >
                  Find matches
                </button>
                {intent.status === 'ACTIVE' && (
                  <button type="button" className="btn-ghost" onClick={() => void handleCancel(intent.id)}>
                    Cancel
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {activeIntent && matches.length > 0 && (
        <div className="flow">
          <h2>{t('meetups.matches', { food: localizeFoodType(activeIntent.foodType, locale) })}</h2>
          {matches.map((match) => (
            <article key={`${match.matchType}-${match.user.id}`} className="glass-card meetup-card">
              <h3>{match.user.fullName ?? match.user.username ?? 'Food mate'}</h3>
              <p>
                Score {match.score} · {match.distanceKm} km · rating {match.user.meetupRating.toFixed(1)}
                {match.user.isPremium && ' · Premium'}
              </p>
              <p className="hint">
                {match.matchType === 'INTENT' ? 'Same food window nearby' : 'Available nearby'} · reliability {match.user.reliabilityScore}
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleInvite(activeIntent.meetupId, match.user.id)}
              >
                {t('nearby.invite')}
              </button>
            </article>
          ))}
        </div>
      )}

      {invites.length > 0 && (
        <div className="flow">
          <h2>Incoming invites</h2>
          {invites.map((invite) => (
            <article key={invite.id} className="glass-card meetup-card">
              <h3>{localizeFoodType(invite.meetup.foodType, locale)}</h3>
              <p>
                From {invite.inviter.fullName ?? invite.inviter.username} ·{' '}
                {new Date(invite.meetup.scheduledAt).toLocaleString()}
              </p>
              {invite.meetup.isFull ? (
                <span className="full-badge">{t('meetups.full')}</span>
              ) : (
                <span className="seats-badge">{t('meetups.seatsLeft', { count: invite.meetup.seatsLeft })}</span>
              )}
              <div className="meetup-card__row">
                <button
                  type="button"
                  className="btn-primary"
                  disabled={invite.meetup.isFull}
                  onClick={() => handleAccept(invite.id)}
                >
                  {invite.meetup.isFull ? t('meetups.full') : t('meetups.join')}
                </button>
                <button type="button" className="btn-secondary" onClick={() => handleReject(invite.id)}>
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {message && <p className="save-success" role="status">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
