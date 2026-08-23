import { formatPlace, localizeDish, localizeFoodType } from '@/data/localize';
import type { EducationLevel, Gender, MealSlot } from '@bitemate/shared';
import { useI18n } from '@/presentation/context/I18nContext';

type DiningPrefs = {
  age?: number | null;
  gender?: Gender | null;
  education?: EducationLevel | null;
  preferredMeals?: MealSlot[] | null;
  favoriteCuisines?: string[] | null;
  favoriteFoods?: string[] | null;
  lookingToEat?: boolean;
  city?: string | null;
  country?: string | null;
};

export function DiningPrefsBlock({ prefs }: { prefs: DiningPrefs }) {
  const { t, locale } = useI18n();
  const meals = prefs.preferredMeals ?? [];
  const cuisines = prefs.favoriteCuisines ?? [];
  const foods = prefs.favoriteFoods ?? [];
  const place = formatPlace(prefs.city, prefs.country, locale);
  const hasAnything =
    prefs.age ||
    prefs.gender ||
    prefs.education ||
    meals.length ||
    cuisines.length ||
    foods.length ||
    prefs.lookingToEat ||
    place;

  if (!hasAnything) {
    return <p className="hint">{t('dining.empty')}</p>;
  }

  return (
    <div className="dining-prefs">
      {prefs.lookingToEat ? <span className="ready-badge">{t('dining.readyToEat')}</span> : null}
      <dl className="profile-list">
        {prefs.age != null ? (
          <div>
            <dt>{t('dining.age')}</dt>
            <dd>{prefs.age}</dd>
          </div>
        ) : null}
        {prefs.gender ? (
          <div>
            <dt>{t('dining.gender')}</dt>
            <dd>{t(`dining.gender.${prefs.gender}`)}</dd>
          </div>
        ) : null}
        {prefs.education ? (
          <div>
            <dt>{t('dining.education')}</dt>
            <dd>{t(`dining.education.${prefs.education}`)}</dd>
          </div>
        ) : null}
        {place ? (
          <div>
            <dt>{t('profile.city')}</dt>
            <dd>{place}</dd>
          </div>
        ) : null}
      </dl>
      {meals.length ? (
        <div className="chip-cloud">
          {meals.map((meal) => (
            <span key={meal} className="filter-chip active">
              {t(`dining.meal.${meal}`)}
            </span>
          ))}
        </div>
      ) : null}
      {cuisines.length ? (
        <div className="chip-cloud">
          {cuisines.map((item) => (
            <span key={item} className="food-chip">
              {localizeFoodType(item, locale)}
            </span>
          ))}
        </div>
      ) : null}
      {foods.length ? (
        <div className="chip-cloud">
          {foods.map((item) => (
            <span key={item} className="food-chip food-chip--name">
              {localizeDish(item, locale)}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
