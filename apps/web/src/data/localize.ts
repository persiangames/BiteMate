import { FAMOUS_DISHES, FOOD_TYPES } from '@/data/food/catalog';
import { dishesForFoodType } from '@/data/food/dish-by-cuisine';
import { DISH_LABELS, FOOD_TYPE_LABELS } from '@/data/food/labels';
import { COUNTRY_LABELS } from '@/data/geo/country-labels';
import { PLACE_LABELS as PLACE_LABELS_CORE } from '@/data/geo/place-labels';
import { PLACE_LABELS_EXTRA } from '@/data/geo/place-labels-extra';
import { citiesForCountry, WORLD_COUNTRIES } from '@/data/geo/world';
import { pickRow, sortOptions, type SelectOption } from '@/data/i18n-lists';

const PLACE_LABELS = { ...PLACE_LABELS_CORE, ...PLACE_LABELS_EXTRA };

function splitItems(value: string): string[] {
  return value
    .split(/[,،]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function localizeCountry(name: string, locale: string): string {
  if (!name) return name;
  return pickRow(COUNTRY_LABELS[name], locale, name);
}

export function localizeCity(city: string, locale: string, countryName?: string): string {
  if (!city) return city;
  if (countryName) {
    const prefixed = PLACE_LABELS[`${countryName}|${city}`];
    if (prefixed) {
      return pickRow(prefixed, locale, city);
    }
  }
  return pickRow(PLACE_LABELS[city], locale, city);
}

export function localizeFoodType(name: string, locale: string): string {
  if (!name) return name;
  return pickRow(FOOD_TYPE_LABELS[name], locale, name);
}

export function localizeDish(name: string, locale: string): string {
  if (!name) return name;
  return pickRow(DISH_LABELS[name], locale, name);
}

export function localizeFoodTypes(value: string, locale: string): string {
  return splitItems(value)
    .map((item) => localizeFoodType(item, locale))
    .join('، ');
}

export function localizeDishes(value: string, locale: string): string {
  return splitItems(value)
    .map((item) => localizeDish(item, locale))
    .join('، ');
}

export function formatPlace(
  city: string | null | undefined,
  country: string | null | undefined,
  locale: string,
): string {
  const parts: string[] = [];
  if (city) parts.push(localizeCity(city, locale, country ?? undefined));
  if (country) parts.push(localizeCountry(country, locale));
  return parts.join(' · ');
}

export function countrySelectOptions(locale: string): SelectOption[] {
  return sortOptions(
    WORLD_COUNTRIES.map((country) => ({
      value: country.name,
      label: localizeCountry(country.name, locale),
    })),
    locale,
  );
}

export function citySelectOptions(countryName: string, locale: string): SelectOption[] {
  if (!countryName) return [];
  return sortOptions(
    citiesForCountry(countryName).map((city) => ({
      value: city,
      label: localizeCity(city, locale, countryName),
    })),
    locale,
  );
}

export function foodTypeSelectOptions(locale: string): SelectOption[] {
  return sortOptions(
    FOOD_TYPES.map((value) => ({
      value,
      label: localizeFoodType(value, locale),
    })),
    locale,
  );
}

export function dishSelectOptions(locale: string): SelectOption[] {
  return sortOptions(
    FAMOUS_DISHES.map((value) => ({
      value,
      label: localizeDish(value, locale),
    })),
    locale,
  );
}

export function dishSelectOptionsForFoodType(foodType: string, locale: string): SelectOption[] {
  const dishes = dishesForFoodType(foodType);
  return sortOptions(
    dishes.map((value) => ({
      value,
      label: localizeDish(value, locale),
    })),
    locale,
  );
}

export function isoForCountry(countryName: string): string | undefined {
  return WORLD_COUNTRIES.find((country) => country.name === countryName)?.iso;
}
