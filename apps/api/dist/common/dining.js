"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ageFromDateOfBirth = void 0;
exports.meetupCapacity = meetupCapacity;
exports.normalizeTags = normalizeTags;
exports.tagsMatch = tagsMatch;
exports.mealFromCategory = mealFromCategory;
exports.isRecentlyOnline = isRecentlyOnline;
exports.diningCompatibility = diningCompatibility;
const shared_1 = require("@bitemate/shared");
Object.defineProperty(exports, "ageFromDateOfBirth", { enumerable: true, get: function () { return shared_1.ageFromDateOfBirth; } });
function meetupCapacity(desiredPeople, acceptedCount) {
    const occupied = acceptedCount + 1;
    const seatsLeft = Math.max(0, desiredPeople - occupied);
    return {
        occupied,
        seatsLeft,
        isFull: seatsLeft <= 0,
    };
}
function normalizeTags(values, max = 20) {
    if (!values?.length) {
        return [];
    }
    const seen = new Set();
    const result = [];
    for (const raw of values) {
        const value = raw.trim().replace(/\s+/g, ' ');
        const key = value.toLowerCase();
        if (!value || seen.has(key)) {
            continue;
        }
        seen.add(key);
        result.push(value);
        if (result.length >= max) {
            break;
        }
    }
    return result;
}
function tagsMatch(haystack, needle) {
    if (!needle?.trim()) {
        return true;
    }
    const query = needle.trim().toLowerCase();
    return haystack.some((item) => item.toLowerCase().includes(query));
}
function mealFromCategory(category) {
    const value = category?.trim().toLowerCase();
    if (value === 'breakfast')
        return 'BREAKFAST';
    if (value === 'lunch')
        return 'LUNCH';
    if (value === 'afternoon')
        return 'AFTERNOON';
    if (value === 'snack')
        return 'SNACK';
    if (value === 'dinner')
        return 'DINNER';
    if (value === 'breakfast' || value === 'BREAKFAST')
        return 'BREAKFAST';
    return null;
}
function isRecentlyOnline(lastLiveLocationAt, minutes = 15) {
    if (!lastLiveLocationAt) {
        return false;
    }
    return Date.now() - lastLiveLocationAt.getTime() <= minutes * 60 * 1000;
}
function diningCompatibility(viewer, candidate) {
    let score = 42;
    const viewerMeals = new Set((viewer?.preferredMeals ?? []).map((item) => item.toLowerCase()));
    const sharedMeals = (candidate.preferredMeals ?? []).filter((item) => viewerMeals.has(item.toLowerCase())).length;
    if (sharedMeals) {
        score += Math.min(18, sharedMeals * 8);
    }
    const viewerFoods = new Set([...(viewer?.favoriteFoods ?? []), ...(viewer?.favoriteCuisines ?? [])].map((item) => item.toLowerCase()));
    const sharedFoods = [...(candidate.favoriteFoods ?? []), ...(candidate.favoriteCuisines ?? [])].filter((item) => viewerFoods.has(item.toLowerCase())).length;
    if (sharedFoods) {
        score += Math.min(20, sharedFoods * 7);
    }
    if (viewer?.city && candidate.city && viewer.city.toLowerCase() === candidate.city.toLowerCase()) {
        score += 10;
    }
    else if (viewer?.country &&
        candidate.country &&
        viewer.country.toLowerCase() === candidate.country.toLowerCase()) {
        score += 5;
    }
    if (candidate.lookingToEat) {
        score += 8;
    }
    return Math.min(99, score);
}
//# sourceMappingURL=dining.js.map