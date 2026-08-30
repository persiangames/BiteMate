import { useEffect, useId, useRef, useState } from 'react';
import type { RestaurantSummaryDto } from '@bitemate/shared';
import { fetchRestaurants } from '@/data/repositories/marketplaceRepository';
import { useI18n } from '@/presentation/context/I18nContext';

export type RestaurantPick = {
  name: string;
  ownerUsername: string | null;
  restaurantId: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  country: string | null;
};

type RestaurantNamePickerProps = {
  accessToken: string | null;
  value: string;
  ownerUsername: string | null;
  city?: string;
  onChange: (pick: RestaurantPick) => void;
  required?: boolean;
};

export function RestaurantNamePicker({
  accessToken,
  value,
  ownerUsername,
  city,
  onChange,
  required = false,
}: RestaurantNamePickerProps) {
  const { t } = useI18n();
  const listId = useId();
  const blurTimer = useRef<number | null>(null);
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RestaurantSummaryDto[]>([]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!accessToken || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = window.setTimeout(() => {
      setLoading(true);
      void fetchRestaurants(accessToken, { search: query.trim(), city: city || undefined })
        .then((response) => setResults(response.items ?? []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 280);

    return () => window.clearTimeout(timer);
  }, [accessToken, query, city]);

  function selectRestaurant(restaurant: RestaurantSummaryDto) {
    onChange({
      name: restaurant.name,
      ownerUsername: restaurant.ownerUsername ?? null,
      restaurantId: restaurant.id,
      latitude: restaurant.latitude ?? null,
      longitude: restaurant.longitude ?? null,
      city: restaurant.city,
      country: restaurant.country,
    });
    setQuery(restaurant.name);
    setOpen(false);
  }

  function applyManualName(name: string) {
    onChange({
      name: name.trim(),
      ownerUsername: null,
      restaurantId: null,
      latitude: null,
      longitude: null,
      city: null,
      country: null,
    });
  }

  return (
    <label className="field restaurant-picker">
      <span>{t('event.restaurantOrPlace')}</span>
      <input
        value={query}
        required={required}
        placeholder={t('event.restaurantOrPlaceHint')}
        aria-autocomplete="list"
        aria-controls={listId}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          applyManualName(next);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = window.setTimeout(() => setOpen(false), 160);
        }}
      />
      {ownerUsername ? (
        <p className="restaurant-picker__member">
          {t('event.restaurantMember', { username: ownerUsername })}
        </p>
      ) : query.trim() ? (
        <p className="hint">{t('event.restaurantManual')}</p>
      ) : null}
      {open && results.length > 0 ? (
        <ul id={listId} className="restaurant-picker__list" role="listbox">
          {results.map((restaurant) => (
            <li key={restaurant.id}>
              <button
                type="button"
                className="restaurant-picker__option"
                role="option"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectRestaurant(restaurant)}
              >
                <strong>{restaurant.name}</strong>
                {restaurant.ownerUsername ? (
                  <span className="hint">@{restaurant.ownerUsername}</span>
                ) : null}
                {restaurant.city ? (
                  <span className="hint">
                    {restaurant.city}
                    {restaurant.country ? `, ${restaurant.country}` : ''}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {loading ? <p className="hint">{t('common.loading')}</p> : null}
    </label>
  );
}
