export const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;
export type Gender = (typeof GENDERS)[number];

export const EDUCATION_LEVELS = [
  'HIGH_SCHOOL',
  'DIPLOMA',
  'BACHELOR',
  'MASTER',
  'PHD',
  'OTHER',
] as const;
export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

export const MEAL_SLOTS = ['BREAKFAST', 'LUNCH', 'AFTERNOON', 'DINNER', 'BEVERAGE', 'SNACK'] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];

export function ageFromDateOfBirth(dateOfBirth: string | Date | null | undefined): number | null {
  if (!dateOfBirth) {
    return null;
  }
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) {
    return null;
  }
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const month = now.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}
