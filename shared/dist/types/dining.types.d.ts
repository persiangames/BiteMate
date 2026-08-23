export declare const GENDERS: readonly ["MALE", "FEMALE", "OTHER"];
export type Gender = (typeof GENDERS)[number];
export declare const EDUCATION_LEVELS: readonly ["HIGH_SCHOOL", "DIPLOMA", "BACHELOR", "MASTER", "PHD", "OTHER"];
export type EducationLevel = (typeof EDUCATION_LEVELS)[number];
export declare const MEAL_SLOTS: readonly ["BREAKFAST", "LUNCH", "AFTERNOON", "DINNER", "SNACK"];
export type MealSlot = (typeof MEAL_SLOTS)[number];
export declare function ageFromDateOfBirth(dateOfBirth: string | Date | null | undefined): number | null;
//# sourceMappingURL=dining.types.d.ts.map