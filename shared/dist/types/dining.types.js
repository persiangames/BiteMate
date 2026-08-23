"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEAL_SLOTS = exports.EDUCATION_LEVELS = exports.GENDERS = void 0;
exports.ageFromDateOfBirth = ageFromDateOfBirth;
exports.GENDERS = ['MALE', 'FEMALE', 'OTHER'];
exports.EDUCATION_LEVELS = [
    'HIGH_SCHOOL',
    'DIPLOMA',
    'BACHELOR',
    'MASTER',
    'PHD',
    'OTHER',
];
exports.MEAL_SLOTS = ['BREAKFAST', 'LUNCH', 'AFTERNOON', 'DINNER', 'SNACK'];
function ageFromDateOfBirth(dateOfBirth) {
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
//# sourceMappingURL=dining.types.js.map