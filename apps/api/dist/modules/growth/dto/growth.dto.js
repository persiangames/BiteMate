"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMeetupReviewDto = exports.AdClickDto = exports.CreateRestaurantAdDto = exports.PremiumSubscribeDto = exports.RankingsQueryDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class RankingsQueryDto {
    city;
    limit = 30;
}
exports.RankingsQueryDto = RankingsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], RankingsQueryDto.prototype, "city", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Object)
], RankingsQueryDto.prototype, "limit", void 0);
class PremiumSubscribeDto {
    paymentMethod;
    idempotencyKey;
}
exports.PremiumSubscribeDto = PremiumSubscribeDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['WALLET', 'STRIPE']),
    __metadata("design:type", String)
], PremiumSubscribeDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], PremiumSubscribeDto.prototype, "idempotencyKey", void 0);
class CreateRestaurantAdDto {
    restaurantId;
    title;
    imageUrl;
    targetUrl;
    budget;
    durationDays;
}
exports.CreateRestaurantAdDto = CreateRestaurantAdDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRestaurantAdDto.prototype, "restaurantId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateRestaurantAdDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateRestaurantAdDto.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateRestaurantAdDto.prototype, "targetUrl", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(10),
    (0, class_validator_1.Max)(10000),
    __metadata("design:type", Number)
], CreateRestaurantAdDto.prototype, "budget", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(90),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateRestaurantAdDto.prototype, "durationDays", void 0);
class AdClickDto {
    referrerUserId;
}
exports.AdClickDto = AdClickDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdClickDto.prototype, "referrerUserId", void 0);
class CreateMeetupReviewDto {
    meetupId;
    reviewedUserId;
    rating;
    comment;
}
exports.CreateMeetupReviewDto = CreateMeetupReviewDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMeetupReviewDto.prototype, "meetupId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMeetupReviewDto.prototype, "reviewedUserId", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], CreateMeetupReviewDto.prototype, "rating", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateMeetupReviewDto.prototype, "comment", void 0);
//# sourceMappingURL=growth.dto.js.map