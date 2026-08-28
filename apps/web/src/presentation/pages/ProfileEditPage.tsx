import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AVAILABILITY_STATUSES, EDUCATION_LEVELS, GENDERS, MEAL_SLOTS, PROFILE_INTERESTS, RELATIONSHIP_STATUSES } from '@bitemate/shared';
import type { AvailabilityStatus, EducationLevel, Gender, MealSlot, UserRole, ProfileInterest, RelationshipStatus } from '@bitemate/shared';
import { geocodeCity } from '@/data/geo/geocode';
import {
  citySelectOptions,
  countrySelectOptions,
  dishSelectOptions,
  foodTypeSelectOptions,
  localizeDishes,
  localizeFoodTypes,
} from '@/data/localize';
import {
  checkUsernameAvailable,
  updateProfile,
} from '@/data/repositories/profileRepository';
import { ProfileCompletionBar } from '@/presentation/components/profile/ProfileCompletionBar';
import { ContactChangePanel } from '@/presentation/components/ContactChangePanel';
import { LocationPickerMap } from '@/presentation/components/LocationPickerMap';
import { ProfileMediaEditor } from '@/presentation/components/ProfileMediaEditor';
import { SaveFeedback } from '@/presentation/components/SaveFeedback';
import { SearchableSelect } from '@/presentation/components/SearchableSelect';
import { useAuth } from '@/presentation/context/AuthContext';
import { useDeviceLocation } from '@/presentation/context/DeviceLocationContext';
import { useI18n } from '@/presentation/context/I18nContext';
import { localizeError } from '@/presentation/i18n/localizeError';

const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,30}$/;

function splitTags(value: string): string[] {
  return value
    .split(/[,،]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export function ProfileEditPage() {
  const { user, accessToken, updateUser } = useAuth();
  const { t, locale } = useI18n();
  const gps = useDeviceLocation();
  const [form, setForm] = useState({
    fullName: user?.fullName ?? '',
    username: user?.username ?? '',
    bio: user?.bio ?? '',
    country: user?.country ?? '',
    city: user?.city ?? '',
    profileImage: user?.profileImage ?? '',
    coverImage: user?.coverImage ?? '',
    liveLocationEnabled: user?.liveLocationEnabled ?? true,
    invisibleMode: user?.invisibleMode ?? false,
    availabilityStatus: (user?.availabilityStatus ?? 'OFFLINE') as AvailabilityStatus,
    liveLatitude: user?.liveLatitude ?? (null as number | null),
    liveLongitude: user?.liveLongitude ?? (null as number | null),
    dateOfBirth: user?.dateOfBirth ?? '',
    gender: (user?.gender ?? '') as Gender | '',
    education: (user?.education ?? '') as EducationLevel | '',
    preferredMeals: user?.preferredMeals ?? ([] as MealSlot[]),
    favoriteCuisines: (user?.favoriteCuisines ?? []).join(', '),
    favoriteFoods: (user?.favoriteFoods ?? []).join(', '),
    lookingToEat: user?.lookingToEat ?? false,
    interests: (user?.interests ?? []) as ProfileInterest[],
    relationshipStatus: (user?.relationshipStatus ?? '') as RelationshipStatus | '',
    hasChildren: user?.hasChildren ?? null,
  });
  const [neighborhood, setNeighborhood] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>(
    'idle',
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef(form);
  formRef.current = form;

  const countryOptions = useMemo(() => countrySelectOptions(locale), [locale]);
  const cityOptions = useMemo(() => citySelectOptions(form.country, locale), [form.country, locale]);
  const cuisineOptions = useMemo(() => foodTypeSelectOptions(locale), [locale]);
  const dishOptions = useMemo(() => dishSelectOptions(locale), [locale]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm((current) => ({
      fullName: user.fullName ?? '',
      username: user.username ?? '',
      bio: user.bio ?? '',
      country: user.country ?? '',
      city: user.city ?? '',
      profileImage: current.profileImage.startsWith('blob:')
        ? current.profileImage
        : (user.profileImage ?? ''),
      coverImage: current.coverImage.startsWith('blob:')
        ? current.coverImage
        : (user.coverImage ?? ''),
      liveLocationEnabled: user.liveLocationEnabled,
      invisibleMode: user.invisibleMode,
      availabilityStatus: user.availabilityStatus,
      liveLatitude: user.liveLatitude ?? current.liveLatitude,
      liveLongitude: user.liveLongitude ?? current.liveLongitude,
      dateOfBirth: user.dateOfBirth ?? '',
      gender: (user.gender ?? '') as Gender | '',
      education: (user.education ?? '') as EducationLevel | '',
      preferredMeals: user.preferredMeals ?? [],
      favoriteCuisines: (user.favoriteCuisines ?? []).join(', '),
      favoriteFoods: (user.favoriteFoods ?? []).join(', '),
      lookingToEat: user.lookingToEat ?? false,
      interests: (user.interests ?? []) as ProfileInterest[],
      relationshipStatus: (user.relationshipStatus ?? '') as RelationshipStatus | '',
      hasChildren: user.hasChildren ?? null,
    }));
  }, [user]);

  useEffect(() => {
    if (!gps.fix) {
      return;
    }
    setForm((current) => {
      if (current.liveLatitude != null && current.liveLongitude != null) {
        return current;
      }
      return {
        ...current,
        liveLatitude: gps.fix!.latitude,
        liveLongitude: gps.fix!.longitude,
        liveLocationEnabled: current.invisibleMode ? current.liveLocationEnabled : true,
      };
    });
  }, [gps.fix]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    const username = form.username.trim().toLowerCase();
    if (!username || username === (user?.username ?? '').toLowerCase()) {
      setUsernameStatus('idle');
      return;
    }
    if (!USERNAME_PATTERN.test(username)) {
      setUsernameStatus('invalid');
      return;
    }

    setUsernameStatus('checking');
    const timer = window.setTimeout(() => {
      void checkUsernameAvailable(accessToken, username)
        .then((result) => setUsernameStatus(result.available ? 'available' : 'taken'))
        .catch(() => setUsernameStatus('idle'));
    }, 400);

    return () => window.clearTimeout(timer);
  }, [accessToken, form.username, user?.username]);

  async function handleCityChange(city: string) {
    setForm((current) => ({ ...current, city }));
    if (!form.country) {
      return;
    }
    const coords = await geocodeCity(form.country, city).catch(() => null);
    if (!coords) {
      return;
    }
    setForm((current) => ({
      ...current,
      city,
      liveLatitude: coords.latitude,
      liveLongitude: coords.longitude,
    }));
  }

  async function persistProfile(patch?: Partial<typeof form>) {
    if (!accessToken) {
      return;
    }
    const next = { ...formRef.current, ...patch };
    const mediaOnly = Boolean(patch && (patch.profileImage !== undefined || patch.coverImage !== undefined));
    if (mediaOnly) {
      const profileImage = patch?.profileImage;
      const coverImage = patch?.coverImage;
      if (profileImage?.startsWith('blob:') || profileImage?.startsWith('data:')) {
        setForm((current) => ({ ...current, ...patch }));
        return;
      }
      if (coverImage?.startsWith('blob:') || coverImage?.startsWith('data:')) {
        setForm((current) => ({ ...current, ...patch }));
        return;
      }
    }
    if (!mediaOnly && (usernameStatus === 'taken' || usernameStatus === 'invalid')) {
      setError(
        usernameStatus === 'taken'
          ? t('profile.username.taken')
          : t('profile.username.invalid'),
      );
      return;
    }

    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      if (mediaOnly) {
        const updated = await updateProfile(accessToken, {
          ...(patch?.profileImage ? { profileImage: patch.profileImage } : {}),
          ...(patch?.coverImage ? { coverImage: patch.coverImage } : {}),
        });
        updateUser(updated);
        setForm((current) => ({
          ...current,
          profileImage: updated.profileImage ?? current.profileImage,
          coverImage: updated.coverImage ?? current.coverImage,
        }));
        setSaved(true);
        return;
      }

      const updated = await updateProfile(accessToken, {
        fullName: next.fullName,
        username: next.username.trim().toLowerCase(),
        bio: next.bio,
        country: next.country,
        city: next.city,
        profileImage: next.profileImage.startsWith('blob:') ? user?.profileImage ?? undefined : next.profileImage,
        coverImage: next.coverImage.startsWith('blob:') ? user?.coverImage ?? undefined : next.coverImage,
        liveLocationEnabled: next.liveLocationEnabled,
        invisibleMode: next.invisibleMode,
        availabilityStatus: next.availabilityStatus,
        liveLatitude: next.liveLatitude ?? undefined,
        liveLongitude: next.liveLongitude ?? undefined,
        dateOfBirth: next.dateOfBirth || undefined,
        gender: next.gender || undefined,
        education: next.education || undefined,
        preferredMeals: next.preferredMeals,
        favoriteCuisines: splitTags(next.favoriteCuisines),
        favoriteFoods: splitTags(next.favoriteFoods),
        lookingToEat: next.lookingToEat,
        interests: next.interests,
        relationshipStatus: next.relationshipStatus || undefined,
        hasChildren: next.hasChildren ?? undefined,
      });
      updateUser(updated);
      setSaved(true);
    } catch (err) {
      setError(localizeError(t, err, 'profile.save.failed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await persistProfile();
  }

  const accuracyText =
    gps.fix?.accuracy != null
      ? t('profile.gpsAccuracy', { meters: Math.round(gps.fix.accuracy) })
      : null;

  if (!user || !accessToken) {
    return null;
  }

  return (
    <main className="page">
      <section className="panel flow">
        <h1>{t('profile.edit')}</h1>
        <ProfileCompletionBar />
        <p>{t('profile.edit.hint')}</p>
        <div className="save-bar">
          <button
            type="button"
            className="btn-primary"
            disabled={loading || usernameStatus === 'taken'}
            onClick={() => void persistProfile()}
          >
            {loading ? t('save.saving') : t('profile.save')}
          </button>
          <SaveFeedback saved={saved} error={error} successKey="profile.saved" />
        </div>

        <ProfileMediaEditor
          accessToken={accessToken}
          name={form.fullName}
          username={form.username}
          profileImage={form.profileImage}
          coverImage={form.coverImage}
          onChange={(next) => {
            setSaved(false);
            setForm((current) => ({ ...current, ...next }));
          }}
        />

        <form className="flow" onSubmit={handleSubmit}>
          <label className="field">
            <span>{t('profile.name')}</span>
            <input
              value={form.fullName}
              onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              maxLength={80}
              required
            />
          </label>
          <label className="field">
            <span>{t('profile.username')}</span>
            <input
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value.toLowerCase() })}
              pattern="[A-Za-z0-9_]{3,30}"
              required
            />
            {usernameStatus === 'checking' ? <small className="hint">{t('profile.usernameChecking')}</small> : null}
            {usernameStatus === 'available' ? <small className="hint username-ok">{t('profile.usernameOk')}</small> : null}
            {usernameStatus === 'taken' ? (
              <small className="error">{t('profile.username.taken')}</small>
            ) : null}
            {usernameStatus === 'invalid' ? (
              <small className="error">{t('profile.username.invalid')}</small>
            ) : null}
          </label>
          <label className="field">
            <span>{t('profile.bio')}</span>
            <textarea
              value={form.bio}
              onChange={(event) => setForm({ ...form, bio: event.target.value })}
              rows={3}
              maxLength={500}
            />
          </label>

          <h2>{t('dining.profileTitle')}</h2>
          <p className="hint">{t('dining.profileHint')}</p>
          <label className="field checkbox">
            <input
              type="checkbox"
              checked={form.lookingToEat}
              onChange={(event) => setForm({ ...form, lookingToEat: event.target.checked })}
            />
            <span>{t('dining.lookingToEat')}</span>
          </label>
          <label className="field">
            <span>{t('auth.dob')}</span>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })}
            />
          </label>
          <label className="field">
            <span>{t('dining.gender')}</span>
            <select
              value={form.gender}
              onChange={(event) => setForm({ ...form, gender: event.target.value as Gender | '' })}
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
              value={form.education}
              onChange={(event) => setForm({ ...form, education: event.target.value as EducationLevel | '' })}
            >
              <option value="">{t('dining.any')}</option>
              {EDUCATION_LEVELS.map((item) => (
                <option key={item} value={item}>
                  {t(`dining.education.${item}`)}
                </option>
              ))}
            </select>
          </label>
          <div>
            <span className="field-label">{t('profile.interests')}</span>
            <div className="chip-cloud">
              {PROFILE_INTERESTS.map((interest) => {
                const selected = form.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    className={`filter-chip${selected ? ' active' : ''}`}
                    onClick={() =>
                      setForm({
                        ...form,
                        interests: selected
                          ? form.interests.filter((item) => item !== interest)
                          : [...form.interests, interest].slice(0, 12),
                      })
                    }
                  >
                    {t(`profile.interest.${interest}`)}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="field">
            <span>{t('profile.relationship')}</span>
            <select
              value={form.relationshipStatus}
              onChange={(event) =>
                setForm({ ...form, relationshipStatus: event.target.value as RelationshipStatus | '' })
              }
            >
              <option value="">{t('dining.any')}</option>
              {RELATIONSHIP_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {t(`profile.relationship.${item}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t('profile.hasChildren')}</span>
            <select
              value={form.hasChildren === null ? '' : form.hasChildren ? 'yes' : 'no'}
              onChange={(event) =>
                setForm({
                  ...form,
                  hasChildren:
                    event.target.value === '' ? null : event.target.value === 'yes',
                })
              }
            >
              <option value="">{t('dining.any')}</option>
              <option value="yes">{t('common.yes')}</option>
              <option value="no">{t('common.no')}</option>
            </select>
          </label>
          <div>
            <span className="field-label">{t('dining.meals')}</span>
            <div className="chip-cloud">
              {MEAL_SLOTS.map((meal) => {
                const selected = form.preferredMeals.includes(meal);
                return (
                  <button
                    key={meal}
                    type="button"
                    className={`filter-chip${selected ? ' active' : ''}`}
                    onClick={() =>
                      setForm({
                        ...form,
                        preferredMeals: selected
                          ? form.preferredMeals.filter((item) => item !== meal)
                          : [...form.preferredMeals, meal],
                      })
                    }
                  >
                    {t(`dining.meal.${meal}`)}
                  </button>
                );
              })}
            </div>
          </div>
          <SearchableSelect
            label={t('dining.foodType')}
            value={form.favoriteCuisines}
            options={cuisineOptions}
            placeholder={t('dining.foodTypeHint')}
            allowCustom
            formatSelected={(value) => localizeFoodTypes(value, locale)}
            onChange={(favoriteCuisines) => setForm({ ...form, favoriteCuisines })}
          />
          <SearchableSelect
            label={t('dining.foodName')}
            value={form.favoriteFoods}
            options={dishOptions}
            placeholder={t('dining.foodNameHint')}
            allowCustom
            formatSelected={(value) => localizeDishes(value, locale)}
            onChange={(favoriteFoods) => setForm({ ...form, favoriteFoods })}
          />

          <SearchableSelect
            label={t('profile.country')}
            value={form.country}
            options={countryOptions}
            placeholder={t('auth.searchHint')}
            onChange={(country) => {
              setForm((current) => ({ ...current, country, city: '' }));
            }}
          />
          <SearchableSelect
            label={t('profile.city')}
            value={form.city}
            options={cityOptions}
            placeholder={form.country ? t('auth.searchHint') : t('auth.selectCountryFirst')}
            disabled={!form.country}
            onChange={(city) => {
              void handleCityChange(city);
            }}
          />

          <div className="location-picker-block">
            <div className="location-picker-block__header">
              <strong>{t('profile.neighborhood')}</strong>
              <p className="hint">
                {gps.connecting
                  ? t('profile.gpsConnecting')
                  : gps.permission === 'granted'
                    ? `${t('profile.gpsConnected')}${accuracyText ? ` · ${accuracyText}` : ''}`
                    : gps.error
                      ? t(gps.error)
                      : t('profile.gpsWaiting')}
              </p>
              {neighborhood ? <p className="hint">{neighborhood}</p> : null}
            </div>
            <LocationPickerMap
              latitude={form.liveLatitude}
              longitude={form.liveLongitude}
              onChange={(next) => {
                setForm((current) => ({
                  ...current,
                  liveLatitude: next.latitude,
                  liveLongitude: next.longitude,
                  liveLocationEnabled: current.invisibleMode ? current.liveLocationEnabled : true,
                }));
                setNeighborhood(next.neighborhood);
              }}
            />
          </div>

          <label className="field checkbox">
            <input
              type="checkbox"
              checked={form.liveLocationEnabled}
              onChange={(event) =>
                setForm({ ...form, liveLocationEnabled: event.target.checked })
              }
            />
            <span>{t('profile.liveLocation')}</span>
          </label>
          <label className="field checkbox">
            <input
              type="checkbox"
              checked={form.invisibleMode}
              onChange={(event) =>
                setForm({ ...form, invisibleMode: event.target.checked })
              }
            />
            <span>{t('profile.invisible')}</span>
          </label>
          <label className="field">
            <span>{t('profile.availability')}</span>
            <select
              value={form.availabilityStatus}
              onChange={(event) =>
                setForm({
                  ...form,
                  availabilityStatus: event.target.value as AvailabilityStatus,
                })
              }
            >
              {AVAILABILITY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`availability.${status}`)}
                </option>
              ))}
            </select>
          </label>

          {user.role && (
            <p>
              {t('profile.roleLabel')}: <strong>{t(`auth.role.${user.role as UserRole}`)}</strong>
            </p>
          )}

          <SaveFeedback saved={saved} error={error} successKey="profile.saved" />

          <button type="submit" className="btn-primary" disabled={loading || usernameStatus === 'taken'}>
            {loading ? t('save.saving') : t('profile.save')}
          </button>
        </form>

        <section className="flow">
          <h2>{t('auth.email')} & {t('auth.phone')}</h2>
          <p className="hint">{t('profile.contactHint')}</p>
          <ContactChangePanel
            accessToken={accessToken}
            email={user.email}
            phoneNumber={user.phoneNumber}
            emailVerified={user.emailVerified}
            phoneVerified={user.phoneVerified}
            onUpdated={updateUser}
          />
        </section>

        <p>
          <Link to="/profile">{t('profile.back')}</Link>
        </p>
      </section>
    </main>
  );
}
