import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  EDUCATION_LEVELS,
  GENDERS,
  MEAL_SLOTS,
  MIN_PROFILE_COMPLETION_FOR_EVENTS,
  PROFILE_INTERESTS,
  type CreateFoodIntentResponseDto,
  type EducationLevel,
  type Gender,
  type MealSlot,
  type ProfileInterest,
} from '@bitemate/shared';
import { createFoodIntent } from '@/data/repositories/intentRepository';
import {
  citySelectOptions,
  countrySelectOptions,
  dishSelectOptionsForFoodType,
  foodTypeSelectOptions,
  resolveCanonicalFoodType,
} from '@/data/localize';
import { EventLocationMap } from '@/presentation/components/EventLocationMap';
import { RestaurantNamePicker } from '@/presentation/components/RestaurantNamePicker';
import { SearchableSelect } from '@/presentation/components/SearchableSelect';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';
import {
  buildMeetupComposerNotes,
  creatorKindLabelKey,
  resolveMeetupCreatorKind,
  type HomeChefServiceMode,
  type ReviewerEventStyle,
  type VenueEventStyle,
} from '@/presentation/utils/meetupEventMeta';

interface MeetupComposerProps {
  onCreated?: (response: CreateFoodIntentResponseDto) => void;
  submitLabelKey?: string;
  successMessageKey?: string;
  embedded?: boolean;
}

export function MeetupComposer({
  onCreated,
  submitLabelKey = 'event.publish',
  successMessageKey = 'event.createdFeed',
  embedded = false,
}: MeetupComposerProps) {
  const { accessToken, user } = useAuth();
  const { t, locale } = useI18n();
  const creatorKind = resolveMeetupCreatorKind(user?.role);

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
  const [preferredInterests, setPreferredInterests] = useState<ProfileInterest[]>([]);
  const [country, setCountry] = useState(user?.country ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [locationLabel, setLocationLabel] = useState('');
  const [restaurantOwnerUsername, setRestaurantOwnerUsername] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [budgetMin, setBudgetMin] = useState<number | ''>('');
  const [budgetMax, setBudgetMax] = useState<number | ''>('');
  const [venueEventStyle, setVenueEventStyle] = useState<VenueEventStyle>('GROUP_DINING');
  const [homeChefServiceMode, setHomeChefServiceMode] = useState<HomeChefServiceMode>('DINE_AT_HOME');
  const [reviewerEventStyle, setReviewerEventStyle] = useState<ReviewerEventStyle>('REVIEW_NIGHT');
  const [venueSpace, setVenueSpace] = useState<'PUBLIC' | 'PRIVATE' | 'HOME'>('PUBLIC');
  const [eventLatitude, setEventLatitude] = useState<number | null>(user?.liveLatitude ?? null);
  const [eventLongitude, setEventLongitude] = useState<number | null>(user?.liveLongitude ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const countryOptions = useMemo(() => countrySelectOptions(locale), [locale]);
  const cityOptions = useMemo(() => citySelectOptions(country, locale), [country, locale]);
  const cuisineOptions = useMemo(() => foodTypeSelectOptions(locale), [locale]);
  const dishOptions = useMemo(() => dishSelectOptionsForFoodType(foodType, locale), [foodType, locale]);

  const profileLocked =
    (user?.profileCompletionPercent ?? 0) < MIN_PROFILE_COMPLETION_FOR_EVENTS;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || eventLatitude === null || eventLongitude === null || profileLocked) {
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const timeStart = new Date(scheduledAt);
    const timeEnd = new Date(timeStart.getTime() + 2 * 60 * 60 * 1000);

    try {
      const response = await createFoodIntent(accessToken, {
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
        locationLabel: locationLabel.trim() || undefined,
        timeStart: timeStart.toISOString(),
        timeEnd: timeEnd.toISOString(),
        radiusKm,
        desiredPeople,
        latitude: eventLatitude,
        longitude: eventLongitude,
        budgetMin: budgetMin === '' ? undefined : Number(budgetMin),
        budgetMax: budgetMax === '' ? undefined : Number(budgetMax),
        notes: buildMeetupComposerNotes(description, {
          creatorKind,
          venueEventStyle: creatorKind === 'VENUE' ? venueEventStyle : undefined,
          homeChefServiceMode: creatorKind === 'HOME_CHEF' ? homeChefServiceMode : undefined,
          reviewerEventStyle: creatorKind === 'REVIEWER' ? reviewerEventStyle : undefined,
          venueSpace: creatorKind === 'HOME_CHEF' || creatorKind === 'DINER' ? venueSpace : undefined,
        }),
        preferredInterests,
      });

      setMessage(t(successMessageKey));
      onCreated?.(response);
    } catch {
      setError(t('error.generic'));
    } finally {
      setLoading(false);
    }
  }

  function toggleInterest(interest: ProfileInterest) {
    setPreferredInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest].slice(0, 8),
    );
  }

  return (
    <div className="meetup-composer">
      {profileLocked ? (
        <section className="glass-card profile-gate">
          <h2>{t('profile.completion.gateTitle')}</h2>
          <p className="hint">
            {t('profile.completion.eventGateHint', {
              percent: user?.profileCompletionPercent ?? 0,
              min: MIN_PROFILE_COMPLETION_FOR_EVENTS,
            })}
          </p>
          <Link to="/profile/edit?highlight=1" className="btn-primary">
            {t('profile.completion.action')}
          </Link>
        </section>
      ) : null}

      {!embedded ? (
        <section className={`meetup-composer__hero glass-card${profileLocked ? ' is-disabled' : ''}`}>
          <p className="meetup-composer__eyebrow">{t('event.new')}</p>
          <h2>{t(creatorKindLabelKey(creatorKind))}</h2>
          <p className="hint">{t(`event.creatorHint.${creatorKind}`)}</p>
        </section>
      ) : null}

      <form className={`meetup-composer__form flow${profileLocked ? ' is-disabled' : ''}`} onSubmit={(event) => void handleSubmit(event)}>
        <section className="glass-card flow meetup-composer__section">
          <h3>{t('event.section.what')}</h3>

          {creatorKind === 'VENUE' ? (
            <label className="field">
              <span>{t('event.venueStyle')}</span>
              <select value={venueEventStyle} onChange={(event) => setVenueEventStyle(event.target.value as VenueEventStyle)}>
                <option value="GROUP_DINING">{t('event.venueStyle.GROUP_DINING')}</option>
                <option value="TASTING">{t('event.venueStyle.TASTING')}</option>
                <option value="SPECIAL_MENU">{t('event.venueStyle.SPECIAL_MENU')}</option>
                <option value="POPUP">{t('event.venueStyle.POPUP')}</option>
              </select>
            </label>
          ) : null}

          {creatorKind === 'HOME_CHEF' ? (
            <>
              <label className="field">
                <span>{t('event.homeChefDish')}</span>
                <input
                  value={foodName}
                  onChange={(event) => setFoodName(event.target.value)}
                  placeholder={t('event.homeChefDishHint')}
                  required
                />
              </label>
              <label className="field">
                <span>{t('event.serviceMode')}</span>
                <select
                  value={homeChefServiceMode}
                  onChange={(event) => setHomeChefServiceMode(event.target.value as HomeChefServiceMode)}
                >
                  <option value="DINE_AT_HOME">{t('event.serviceMode.DINE_AT_HOME')}</option>
                  <option value="PICKUP">{t('event.serviceMode.PICKUP')}</option>
                  <option value="DELIVERY">{t('event.serviceMode.DELIVERY')}</option>
                  <option value="PUBLIC_MEETUP">{t('event.serviceMode.PUBLIC_MEETUP')}</option>
                </select>
              </label>
              <label className="field">
                <span>{t('event.venueSpace')}</span>
                <select value={venueSpace} onChange={(event) => setVenueSpace(event.target.value as 'PUBLIC' | 'PRIVATE' | 'HOME')}>
                  <option value="HOME">{t('event.venueSpace.HOME')}</option>
                  <option value="PUBLIC">{t('event.venueSpace.PUBLIC')}</option>
                  <option value="PRIVATE">{t('event.venueSpace.PRIVATE')}</option>
                </select>
              </label>
              <div className="filter-grid">
                <label className="field">
                  <span>{t('event.priceFrom')}</span>
                  <input
                    type="number"
                    min={0}
                    value={budgetMin}
                    onChange={(event) => setBudgetMin(event.target.value === '' ? '' : Number(event.target.value))}
                  />
                </label>
                <label className="field">
                  <span>{t('event.priceTo')}</span>
                  <input
                    type="number"
                    min={0}
                    value={budgetMax}
                    onChange={(event) => setBudgetMax(event.target.value === '' ? '' : Number(event.target.value))}
                  />
                </label>
              </div>
            </>
          ) : null}

          {creatorKind === 'REVIEWER' ? (
            <label className="field">
              <span>{t('event.reviewerStyle')}</span>
              <select
                value={reviewerEventStyle}
                onChange={(event) => setReviewerEventStyle(event.target.value as ReviewerEventStyle)}
              >
                <option value="REVIEW_NIGHT">{t('event.reviewerStyle.REVIEW_NIGHT')}</option>
                <option value="TASTING_TOUR">{t('event.reviewerStyle.TASTING_TOUR')}</option>
                <option value="COLLAB_MEAL">{t('event.reviewerStyle.COLLAB_MEAL')}</option>
              </select>
            </label>
          ) : null}

          <SearchableSelect
            label={t('dining.foodType')}
            value={foodType}
            options={cuisineOptions}
            placeholder={t('dining.foodTypeHint')}
            allowCustom
            onChange={(value) => {
              setFoodType(resolveCanonicalFoodType(value));
              if (creatorKind !== 'HOME_CHEF') {
                setFoodName('');
              }
            }}
          />

          {creatorKind !== 'HOME_CHEF' ? (
            <SearchableSelect
              key={foodType || 'no-food-type'}
              label={t('dining.foodName')}
              value={foodName}
              options={dishOptions}
              placeholder={foodType ? t('dining.foodNameHint') : t('dining.selectFoodTypeFirst')}
              allowCustom
              disabled={!foodType}
              onChange={setFoodName}
            />
          ) : null}

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
            <span>{t('event.description')}</span>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t(`event.descriptionHint.${creatorKind}`)}
            />
          </label>
        </section>

        <section className="glass-card flow meetup-composer__section">
          <h3>{t('event.section.whenWhere')}</h3>
          <label className="field">
            <span>{t('meetups.when')}</span>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              required
            />
          </label>

          <RestaurantNamePicker
            accessToken={accessToken}
            value={locationLabel}
            ownerUsername={restaurantOwnerUsername}
            city={city}
            required={creatorKind === 'VENUE'}
            onChange={(pick) => {
              setLocationLabel(pick.name);
              setRestaurantOwnerUsername(pick.ownerUsername);
              if (pick.city) {
                setCity(pick.city);
              }
              if (pick.country) {
                setCountry(pick.country);
              }
              if (pick.latitude != null && pick.longitude != null) {
                setEventLatitude(pick.latitude);
                setEventLongitude(pick.longitude);
              }
            }}
          />

          <EventLocationMap
            eventLatitude={eventLatitude}
            eventLongitude={eventLongitude}
            onEventLocationChange={(fix) => {
              setEventLatitude(fix.latitude);
              setEventLongitude(fix.longitude);
              if (fix.city) {
                setCity(fix.city);
              }
              if (fix.country) {
                setCountry(fix.country);
              }
            }}
          />

          <div className="filter-grid">
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
          </div>
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
          {eventLatitude !== null && eventLongitude !== null ? (
            <p className="hint">
              {t('event.locationReady', {
                lat: eventLatitude.toFixed(4),
                lng: eventLongitude.toFixed(4),
              })}
            </p>
          ) : (
            <p className="hint">{t('event.locationPending')}</p>
          )}
        </section>

        <section className="glass-card flow meetup-composer__section">
          <h3>{t('event.section.companions')}</h3>
          <p className="hint">{t('event.companionsHint')}</p>

          <label className="field">
            <span>{t('dining.preferredGender')}</span>
            <select value={preferredGender} onChange={(event) => setPreferredGender(event.target.value as Gender | '')}>
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

          <div className="field-group">
            <span className="field-label">{t('event.preferredInterests')}</span>
            <div className="chip-cloud">
              {PROFILE_INTERESTS.map((interest) => {
                const selected = preferredInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    className={`filter-chip${selected ? ' active' : ''}`}
                    aria-pressed={selected}
                    onClick={() => toggleInterest(interest)}
                  >
                    {t(`profile.interest.${interest}`)}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {error ? <p className="error">{error}</p> : null}
        {message ? <p className="save-success">{message}</p> : null}

        <button
          type="submit"
          className="btn-primary meetup-composer__submit"
          disabled={loading || eventLatitude === null || eventLongitude === null}
        >
          {loading ? t('meetups.creating') : t(submitLabelKey)}
        </button>
      </form>
    </div>
  );
}
