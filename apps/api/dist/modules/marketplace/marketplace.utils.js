"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidTime = assertValidTime;
exports.parseDateOnly = parseDateOnly;
exports.assertFutureDate = assertFutureDate;
exports.decimalToNumber = decimalToNumber;
exports.discountedPrice = discountedPrice;
exports.assertOwner = assertOwner;
exports.assertFound = assertFound;
exports.recalculateRestaurantRating = recalculateRestaurantRating;
exports.recalculateHomeChefRating = recalculateHomeChefRating;
const common_1 = require("@nestjs/common");
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
function assertValidTime(value, field) {
    if (!TIME_PATTERN.test(value)) {
        throw new common_1.BadRequestException(`${field} must be in HH:mm format`);
    }
}
function parseDateOnly(value, field) {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
        throw new common_1.BadRequestException(`${field} must be a valid date (YYYY-MM-DD)`);
    }
    return parsed;
}
function assertFutureDate(date, field) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (date < today) {
        throw new common_1.BadRequestException(`${field} must be today or in the future`);
    }
}
function decimalToNumber(value) {
    return typeof value === 'number' ? value : value.toNumber();
}
function discountedPrice(price, discountPercent) {
    if (discountPercent <= 0) {
        return price;
    }
    return Math.round(price * (1 - discountPercent / 100) * 100) / 100;
}
function assertOwner(userId, ownerId, message) {
    if (userId !== ownerId) {
        throw new common_1.ForbiddenException(message);
    }
}
function assertFound(value, message) {
    if (!value) {
        throw new common_1.NotFoundException(message);
    }
    return value;
}
async function recalculateRestaurantRating(tx, restaurantId) {
    const aggregate = await tx.review.aggregate({
        where: { restaurantId, targetType: 'RESTAURANT' },
        _avg: { rating: true },
        _count: { rating: true },
    });
    await tx.restaurant.update({
        where: { id: restaurantId },
        data: {
            averageRating: aggregate._avg.rating ?? 0,
            reviewCount: aggregate._count.rating,
        },
    });
}
async function recalculateHomeChefRating(tx, homeChefProfileId) {
    const aggregate = await tx.review.aggregate({
        where: { homeChefProfileId, targetType: 'HOME_CHEF' },
        _avg: { rating: true },
        _count: { rating: true },
    });
    await tx.homeChefProfile.update({
        where: { id: homeChefProfileId },
        data: {
            averageRating: aggregate._avg.rating ?? 0,
            reviewCount: aggregate._count.rating,
        },
    });
}
//# sourceMappingURL=marketplace.utils.js.map