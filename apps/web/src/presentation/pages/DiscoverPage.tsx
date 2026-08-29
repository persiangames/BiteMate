import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  EDUCATION_LEVELS,
  GENDERS,
  MEAL_SLOTS,
} from '@bitemate/shared';
import type {
  EducationLevel,
  Gender,
  MealSlot,
  NearbyMeetupDto,
  NearbyUserDto,
} from '@bitemate/shared';
import {
  citySelectOptions,
  countrySelectOptions,
  dishSelectOptionsForFoodType,
  foodTypeSelectOptions,
  formatPlace,
  localizeDish,
  localizeFoodType,
  resolveCanonicalFoodType,
} from '@/data/localize';
import { fetchMyIntents } from '@/data/repositories/intentRepository';
import { fetchMyMeetups, requestMeetupJoin, sendMeetupInvite } from '@/data/repositories/meetupRepository';
import { fetchNearbyMeetups, fetchNearbyUsers, updateLiveLocation, updateProfile } from '@/data/repositories/profileRepository';
import { NearbyMap } from '@/presentation/components/NearbyMap';
import { Avatar } from '@/presentation/components/Avatar';
import { SearchableSelect } from '@/presentation/components/SearchableSelect';
import { useAuth } from '@/presentation/context/AuthContext';
import { useDeviceLocation } from '@/presentation/context/DeviceLocationContext';
import { useI18n } from '@/presentation/context/I18nContext';
import { localizeError } from '@/presentation/i18n/localizeError';

const TEHRAN = { latitude: 35.6892, longitude: 51.389 };

type Filters = {
  radiusKm: number;
  ageMin: number;
  ageMax: number;
  gender: Gender | '';
  education: EducationLevel | '';
  mealSlot: MealSlot | '';
  country: string;
  city: string;
  foodType: string;
  foodName: string;
  lookingToEat: boolean;
};

const DEFAULT_FILTERS: Filters = {
  radiusKm: 10,
  ageMin: 18,
  ageMax: 65,
  gender: '',
  education: '',
  mealSlot: '',
  country: '',
  city: '',
  foodType: '',
  foodName: '',
  lookingToEat: false,
};

function fallbackCenter(user: { liveLatitude?: number | null; liveLongitude?: number | null } | null) {
  if (user?.liveLatitude != null && user?.liveLongitude != null) {
    return { latitude: user.liveLatitude, longitude: user.liveLongitude };
  }
  return TEHRAN;
}

export function DiscoverPage() {
  const { user, accessToken, updateUser } = useAuth();
  const { t, locale } = useI18n();
  const gps = useDeviceLocation();
  const navigate = useNavigate();
  const [center, setCenter] = useState(() => fallbackCenter(user));
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUserDto[]>([]);
  const [events, setEvents] = useState<NearbyMeetupDto[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const countryOptions = useMemo(() => countrySelectOptions(locale), [locale]);
  const cityOptions = useMemo(
    () => citySelectOptions(filters.country, locale),
    [filters.country, locale],
  );
  const cuisineOptions = useMemo(() => foodTypeSelectOptions(locale), [locale]);
  const dishOptions = useMemo(
    () => dishSelectOptionsForFoodType(filters.foodType, locale),
    [filters.foodType, locale],
  );

  useEffect(() => {
    const next = gps.fix
      ? { latitude: gps.fix.latitude, longitude: gps.fix.longitude }
      : fallbackCenter(user);
    setCenter((prev) =>
      prev.latitude === next.latitude && prev.longitude === next.longitude ? prev : next,
    );
  }, [gps.fix, user]);

  useEffect(() => {
    if (!accessToken || !center) {
      return;
    }
    const query = {
      latitude: center.latitude,
      longitude: center.longitude,
      radiusKm: applied.radiusKm,
      ageMin: applied.ageMin,
      ageMax: applied.ageMax,
      gender: applied.gender || undefined,
      education: applied.education || undefined,
      mealSlot: applied.mealSlot || undefined,
      country: applied.country || undefined,
      city: applied.city || undefined,
      foodType: applied.foodType || undefined,
      foodName: applied.foodName || undefined,
      lookingToEat: applied.lookingToEat || undefined,
    };
    setError(null);
    void Promise.allSettled([
      fetchNearbyUsers(accessToken, query),
      fetchNearbyMeetups(accessToken, query),
    ]).then(([peopleResult, tablesResult]) => {
      if (peopleResult.status === 'fulfilled') {
        setNearbyUsers(peopleResult.value.users);
        setCardIndex(0);
      }
      if (tablesResult.status === 'fulfilled') {
        setEvents(tablesResult.value.items);
      }
      if (peopleResult.status === 'rejected') {
        setError(localizeError(t, peopleResult.reason, 'error.loadFailed'));
      }
    });
  }, [accessToken, center, applied, t]);

  useEffect(() => {
    if (!accessToken || !gps.fix || !user?.liveLocationEnabled) {
      return;
    }
    void updateLiveLocation(accessToken, {
      latitude: gps.fix.latitude,
      longitude: gps.fix.longitude,
    }).catch(() => undefined);
  }, [accessToken, gps.fix, user?.liveLocationEnabled]);

  const current = nearbyUsers[cardIndex] ?? null;
  const remaining = Math.max(0, nearbyUsers.length - cardIndex);

  async function toggleLookingToEat() {
    if (!accessToken || !user) {
      return;
    }
    try {
      const updated = await updateProfile(accessToken, { lookingToEat: !user.lookingToEat });
      updateUser(updated);
    } catch (err) {
      setError(localizeError(t, err, 'profile.save.failed'));
    }
  }

  async function inviteToEat(person: NearbyUserDto) {
    if (!accessToken) {
      return;
    }
    setInviting(true);
    setInviteMessage(null);
    setError(null);
    try {
      const [intents, meetups] = await Promise.all([
        fetchMyIntents(accessToken),
        fetchMyMeetups(accessToken),
      ]);
      const openMeetup =
        meetups.find((item) => !item.isFull && (item.status === 'OPEN' || item.status === 'SCHEDULED')) ??
        null;
      const openIntent = intents.items.find((item) => item.status === 'ACTIVE' && item.meetupId);
      const meetupId = openMeetup?.id ?? openIntent?.meetupId;
      if (!meetupId) {
        navigate(`/meetups?invitee=${person.id}`);
        return;
      }
      if (openMeetup?.isFull) {
        setInviteMessage(t('meetups.full'));
        return;
      }
      await sendMeetupInvite(accessToken, { meetupId, inviteeId: person.id });
      setInviteMessage(t('meetups.inviteSent'));
      setCardIndex((index) => index + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setError(message.toLowerCase().includes('full') ? t('meetups.full') : localizeError(t, err, 'error.generic'));
    } finally {
      setInviting(false);
    }
  }

  async function joinTable(event: NearbyMeetupDto) {
    if (!accessToken || event.isFull) {
      return;
    }

    setJoiningId(event.id);
    setInviteMessage(null);
    setError(null);

    try {
      const invite = await requestMeetupJoin(accessToken, { meetupId: event.id });
      setInviteMessage(t('meetups.accepted'));
      if (invite.meetup.roomId) {
        navigate(`/meetups/room/${invite.meetup.roomId}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setError(
        message.toLowerCase().includes('full')
          ? t('meetups.full')
          : message.toLowerCase().includes('preferences')
            ? t('event.joinBlocked')
            : localizeError(t, err, 'error.generic'),
      );
    } finally {
      setJoiningId(null);
    }
  }

  return (
    <div className="app-screen discover-screen">
      <header className="screen-header screen-header--actions">
        <p className="hint screen-header__hint">{t('nearby.tagline')}</p>
        <button type="button" className="btn-secondary btn-compact" onClick={() => setShowFilters((value) => !value)}>
          {t('nearby.filters')}
        </button>
      </header>

      <div className="discover-toolbar">
        <button
          type="button"
          className={`looking-toggle${user?.lookingToEat ? ' is-on' : ''}`}
          onClick={() => void toggleLookingToEat()}
        >
          {user?.lookingToEat ? t('dining.readyOn') : t('dining.readyOff')}
        </button>
        <button type="button" className="filter-chip filter-chip--map" onClick={() => setShowMap((value) => !value)}>
          {showMap ? t('nearby.hideMap') : t('nearby.showMap')}
        </button>
      </div>

      {showMap ? <NearbyMap center={center} nearbyUsers={nearbyUsers} /> : null}

      {showFilters ? (
        <section className="glass-card flow discover-filters">
          <label className="field">
            <span>
              {t('nearby.distance')}: {filters.radiusKm} {t('nearby.km')}
            </span>
            <input
              type="range"
              min={1}
              max={50}
              value={filters.radiusKm}
              onChange={(event) => setFilters({ ...filters, radiusKm: Number(event.target.value) })}
            />
          </label>
          <div className="filter-grid">
            <label className="field">
              <span>{t('dining.ageMin')}</span>
              <input
                type="number"
                min={18}
                max={99}
                value={filters.ageMin}
                onChange={(event) => setFilters({ ...filters, ageMin: Number(event.target.value) })}
              />
            </label>
            <label className="field">
              <span>{t('dining.ageMax')}</span>
              <input
                type="number"
                min={18}
                max={99}
                value={filters.ageMax}
                onChange={(event) => setFilters({ ...filters, ageMax: Number(event.target.value) })}
              />
            </label>
          </div>
          <label className="field">
            <span>{t('dining.gender')}</span>
            <select
              value={filters.gender}
              onChange={(event) => setFilters({ ...filters, gender: event.target.value as Gender | '' })}
            >
              <option value="">{t('dining.any')}</option>
              {GENDERS.map((item) => (
                <option key={item} value={item}>
                  {t(`dining.gender.${item}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t('dining.education')}</span>
            <select
              value={filters.education}
              onChange={(event) =>
                setFilters({ ...filters, education: event.target.value as EducationLevel | '' })
              }
            >
              <option value="">{t('dining.any')}</option>
              {EDUCATION_LEVELS.map((item) => (
                <option key={item} value={item}>
                  {t(`dining.education.${item}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t('dining.meal')}</span>
            <select
              value={filters.mealSlot}
              onChange={(event) => setFilters({ ...filters, mealSlot: event.target.value as MealSlot | '' })}
            >
              <option value="">{t('dining.any')}</option>
              {MEAL_SLOTS.map((meal) => (
                <option key={meal} value={meal}>
                  {t(`dining.meal.${meal}`)}
                </option>
              ))}
            </select>
          </label>
          <SearchableSelect
            label={t('profile.country')}
            value={filters.country}
            options={countryOptions}
            placeholder={t('auth.searchHint')}
            onChange={(country) => setFilters({ ...filters, country, city: '' })}
          />
          <SearchableSelect
            label={t('profile.city')}
            value={filters.city}
            options={cityOptions}
            placeholder={filters.country ? t('auth.searchHint') : t('auth.selectCountryFirst')}
            disabled={!filters.country}
            onChange={(city) => setFilters({ ...filters, city })}
          />
          <SearchableSelect
            label={t('dining.foodType')}
            value={filters.foodType}
            options={cuisineOptions}
            placeholder={t('dining.foodTypeHint')}
            allowCustom
            onChange={(foodType) =>
              setFilters({
                ...filters,
                foodType: resolveCanonicalFoodType(foodType),
                foodName: '',
              })
            }
          />
          <SearchableSelect
            key={filters.foodType || 'no-food-type'}
            label={t('dining.foodName')}
            value={filters.foodName}
            options={dishOptions}
            placeholder={
              filters.foodType ? t('dining.foodNameHint') : t('dining.selectFoodTypeFirst')
            }
            allowCustom
            disabled={!filters.foodType}
            onChange={(foodName) => setFilters({ ...filters, foodName })}
          />
          <label className="field checkbox">
            <input
              type="checkbox"
              checked={filters.lookingToEat}
              onChange={(event) => setFilters({ ...filters, lookingToEat: event.target.checked })}
            />
            <span>{t('nearby.onlyReady')}</span>
          </label>
          <div className="meetup-card__row">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setApplied(filters);
                setShowFilters(false);
              }}
            >
              {t('nearby.apply')}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setFilters(DEFAULT_FILTERS);
                setApplied(DEFAULT_FILTERS);
              }}
            >
              {t('nearby.reset')}
            </button>
          </div>
        </section>
      ) : null}

      {error ? <p className="error">{error}</p> : null}
      {inviteMessage ? <p className="save-success" role="status">{inviteMessage}</p> : null}
      {gps.connecting && !gps.fix ? <p className="hint">{t('nearby.detecting')}</p> : null}

      {current ? (
        <article className="dating-card">
          <div className="dating-card__photo">
            <Avatar name={current.fullName ?? current.username} imageUrl={current.profileImage} size="lg" />
            {current.isOnline ? <span className="online-dot" /> : null}
            {current.lookingToEat ? <span className="ready-badge dating-card__ready">{t('dining.readyToEat')}</span> : null}
          </div>
          <div className="dating-card__body">
            <div className="dating-card__title">
              <h2>
                {current.fullName ?? current.username ?? t('nearby.foodMate')}
                {current.age != null ? <span>, {current.age}</span> : null}
              </h2>
              <strong className="compat-score">{current.compatibility}%</strong>
            </div>
            <p className="hint">
              {current.distanceKm.toFixed(1)} {t('nearby.km')}
              {current.city || current.country
                ? ` · ${formatPlace(current.city, current.country, locale)}`
                : ''}
              {current.education ? ` · ${t(`dining.education.${current.education}`)}` : ''}
            </p>
            {current.bio ? <p>{current.bio}</p> : <p className="hint">{t('nearby.noBio')}</p>}
            <div className="chip-cloud">
              {current.preferredMeals.map((meal) => (
                <span key={meal} className="filter-chip active">
                  {t(`dining.meal.${meal}`)}
                </span>
              ))}
              {current.favoriteCuisines.map((item) => (
                <span key={item} className="food-chip">
                  {localizeFoodType(item, locale)}
                </span>
              ))}
              {current.favoriteFoods.map((item) => (
                <span key={`food-${item}`} className="food-chip food-chip--name">
                  {localizeDish(item, locale)}
                </span>
              ))}
            </div>
            <p className="hint">
              {t('nearby.rating', {
                rating: current.meetupRating.toFixed(1),
                count: current.meetupReviewCount,
              })}
            </p>
          </div>
          <div className="dating-actions">
            <button type="button" className="dating-btn dating-btn--pass" onClick={() => setCardIndex((index) => index + 1)}>
              {t('nearby.pass')}
            </button>
            {current.username ? (
              <Link to={`/u/${current.username}`} className="dating-btn dating-btn--profile">
                {t('nearby.viewProfile')}
              </Link>
            ) : null}
            <button
              type="button"
              className="dating-btn dating-btn--invite"
              disabled={inviting}
              onClick={() => void inviteToEat(current)}
            >
              {t('nearby.invite')}
            </button>
          </div>
          <p className="hint dating-remaining">{t('nearby.remaining', { count: remaining })}</p>
        </article>
      ) : (
        <section className="glass-card flow">
          <h2>{t('nearby.emptyTitle')}</h2>
          <p className="hint">{t('nearby.emptyHint')}</p>
          <button type="button" className="btn-secondary" onClick={() => setShowFilters(true)}>
            {t('nearby.filters')}
          </button>
        </section>
      )}

      <section className="glass-card flow">
        <h2>{t('nearby.openTables')}</h2>
        {inviteMessage ? <p className="save-success">{inviteMessage}</p> : null}
        {events.length === 0 ? (
          <p className="hint">{t('nearby.noTables')}</p>
        ) : (
          <ul className="table-list">
            {events.map((event) => (
              <li key={event.id} className="table-card">
                <div>
                  <strong>
                    {event.foodName
                      ? localizeDish(event.foodName, locale)
                      : event.foodType
                        ? localizeFoodType(event.foodType, locale)
                        : ''}
                  </strong>
                  <p className="hint">
                    {event.mealSlot ? `${t(`dining.meal.${event.mealSlot as MealSlot}`)} · ` : ''}
                    {new Date(event.scheduledAt).toLocaleString()} · {event.distanceKm.toFixed(1)} {t('nearby.km')}
                  </p>
                  <p className="hint">
                    {event.city || event.country
                      ? formatPlace(event.city, event.country, locale)
                      : (event.locationLabel ?? '')}
                    {event.foodType ? ` · ${localizeFoodType(event.foodType, locale)}` : ''}
                  </p>
                  {event.preferredInterests.length > 0 ? (
                    <p className="hint">
                      {t('event.interestMatch', { count: event.preferredInterests.length })}
                    </p>
                  ) : null}
                </div>
                <div className="table-card__actions">
                  {event.isFull ? (
                    <span className="full-badge">{t('meetups.full')}</span>
                  ) : (
                    <>
                      <span className="seats-badge">{t('meetups.seatsLeft', { count: event.seatsLeft })}</span>
                      <button
                        type="button"
                        className="btn-primary btn-compact"
                        disabled={joiningId === event.id}
                        onClick={() => void joinTable(event)}
                      >
                        {joiningId === event.id ? t('common.loading') : t('meetups.join')}
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
