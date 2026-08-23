import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { DayOfWeek } from '@bitemate/shared';
import { DAYS_OF_WEEK } from '@bitemate/shared';
import {
  citySelectOptions,
  countrySelectOptions,
  foodTypeSelectOptions,
  localizeFoodTypes,
} from '@/data/localize';
import { createRestaurant } from '@/data/repositories/marketplaceRepository';
import { SearchableSelect } from '@/presentation/components/SearchableSelect';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

const defaultHours = DAYS_OF_WEEK.map((dayOfWeek) => ({
  dayOfWeek,
  openTime: '09:00',
  closeTime: '22:00',
  isClosed: dayOfWeek === 'SUNDAY',
}));

export function CreateRestaurantPage() {
  const { accessToken, user } = useAuth();
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState(user?.city ?? '');
  const [country, setCountry] = useState(user?.country ?? '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cuisineTypes, setCuisineTypes] = useState('');
  const [openingHours, setOpeningHours] = useState(defaultHours);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const countryOptions = useMemo(() => countrySelectOptions(locale), [locale]);
  const cityOptions = useMemo(() => citySelectOptions(country, locale), [country, locale]);
  const cuisineOptions = useMemo(() => foodTypeSelectOptions(locale), [locale]);

  useEffect(() => {
    if (user?.role !== 'RESTAURANT_OWNER') {
      setError('Only restaurant owners can create a restaurant profile.');
    }
  }, [user?.role]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const restaurant = await createRestaurant(accessToken, {
        name,
        description: description || undefined,
        address: address || undefined,
        city: city || undefined,
        country: country || undefined,
        phoneNumber: phoneNumber || undefined,
        cuisineTypes: cuisineTypes
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        openingHours,
      });
      navigate(`/marketplace/restaurants/${restaurant.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create restaurant');
    } finally {
      setLoading(false);
    }
  }

  function updateHour(dayOfWeek: DayOfWeek, field: 'openTime' | 'closeTime' | 'isClosed', value: string | boolean) {
    setOpeningHours((current) =>
      current.map((hour) =>
        hour.dayOfWeek === dayOfWeek ? { ...hour, [field]: value } : hour,
      ),
    );
  }

  return (
    <main className="page">
      <section className="panel flow">
        <div className="toolbar">
          <h1>{t('profile.createRestaurant')}</h1>
          <Link to="/marketplace/restaurants">Back</Link>
        </div>

        <form className="flow" onSubmit={handleSubmit}>
          <label className="field">
            <span>Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label className="field">
            <span>Description</span>
            <input value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label className="field">
            <span>Address</span>
            <input value={address} onChange={(event) => setAddress(event.target.value)} />
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
          <label className="field">
            <span>Phone</span>
            <input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} />
          </label>
          <SearchableSelect
            label={t('dining.foodType')}
            value={cuisineTypes}
            options={cuisineOptions}
            placeholder={t('dining.foodTypeHint')}
            allowCustom
            formatSelected={(value) => localizeFoodTypes(value, locale)}
            onChange={setCuisineTypes}
          />

          <div className="flow">
            <h2>Opening hours</h2>
            {openingHours.map((hour) => (
              <div key={hour.dayOfWeek} className="hours-row">
                <strong>{hour.dayOfWeek}</strong>
                <label>
                  <input
                    type="checkbox"
                    checked={hour.isClosed}
                    onChange={(event) => updateHour(hour.dayOfWeek, 'isClosed', event.target.checked)}
                  />
                  Closed
                </label>
                <input
                  value={hour.openTime}
                  onChange={(event) => updateHour(hour.dayOfWeek, 'openTime', event.target.value)}
                  disabled={hour.isClosed}
                />
                <input
                  value={hour.closeTime}
                  onChange={(event) => updateHour(hour.dayOfWeek, 'closeTime', event.target.value)}
                  disabled={hour.isClosed}
                />
              </div>
            ))}
          </div>

          {error && <p className="error" role="alert">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading || user?.role !== 'RESTAURANT_OWNER'}>
            {loading ? t('save.saving') : t('profile.createRestaurant')}
          </button>
        </form>
      </section>
    </main>
  );
}
