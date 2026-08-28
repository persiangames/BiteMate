import { FOOD_TYPES } from '@/data/food/catalog';
import { FOOD_TYPE_LABELS } from '@/data/food/labels';

/** Map a stored or localized food-type label back to the canonical FOOD_TYPES key. */
export function resolveCanonicalFoodType(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return '';
  }

  if ((FOOD_TYPES as readonly string[]).includes(trimmed)) {
    return trimmed;
  }

  const lower = trimmed.toLowerCase();
  for (const foodType of FOOD_TYPES) {
    if (foodType.toLowerCase() === lower) {
      return foodType;
    }

    const labels = FOOD_TYPE_LABELS[foodType];
    if (labels?.some((label) => label.toLowerCase() === lower)) {
      return foodType;
    }
  }

  return trimmed;
}

export function splitFoodTypeField(value: string): string[] {
  return value
    .split(/[,،]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map(resolveCanonicalFoodType);
}
