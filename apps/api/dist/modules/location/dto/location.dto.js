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
exports.NearbyUsersQueryDto = exports.UpdateLiveLocationDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const shared_1 = require("@bitemate/shared");
function emptyToUndefined(value) {
    if (value === '' || value === null || value === undefined) {
        return undefined;
    }
    return value;
}
class UpdateLiveLocationDto {
    latitude;
    longitude;
}
exports.UpdateLiveLocationDto = UpdateLiveLocationDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], UpdateLiveLocationDto.prototype, "latitude", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], UpdateLiveLocationDto.prototype, "longitude", void 0);
class NearbyUsersQueryDto {
    latitude;
    longitude;
    radius = 10;
    role;
    availability;
    ageMin;
    ageMax;
    gender;
    education;
    mealSlot;
    country;
    city;
    foodType;
    foodName;
    lookingToEat;
    get radiusKm() {
        return this.radius;
    }
}
exports.NearbyUsersQueryDto = NearbyUsersQueryDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], NearbyUsersQueryDto.prototype, "latitude", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], NearbyUsersQueryDto.prototype, "longitude", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], NearbyUsersQueryDto.prototype, "radius", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.USER_ROLES),
    __metadata("design:type", String)
], NearbyUsersQueryDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.AVAILABILITY_STATUSES),
    __metadata("design:type", String)
], NearbyUsersQueryDto.prototype, "availability", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => emptyToUndefined(value)),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(18),
    (0, class_validator_1.Max)(99),
    __metadata("design:type", Number)
], NearbyUsersQueryDto.prototype, "ageMin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => emptyToUndefined(value)),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(18),
    (0, class_validator_1.Max)(99),
    __metadata("design:type", Number)
], NearbyUsersQueryDto.prototype, "ageMax", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => emptyToUndefined(value)),
    (0, class_validator_1.IsEnum)(shared_1.GENDERS),
    __metadata("design:type", String)
], NearbyUsersQueryDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => emptyToUndefined(value)),
    (0, class_validator_1.IsEnum)(shared_1.EDUCATION_LEVELS),
    __metadata("design:type", String)
], NearbyUsersQueryDto.prototype, "education", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => emptyToUndefined(value)),
    (0, class_validator_1.IsEnum)(shared_1.MEAL_SLOTS),
    __metadata("design:type", String)
], NearbyUsersQueryDto.prototype, "mealSlot", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => emptyToUndefined(value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], NearbyUsersQueryDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => emptyToUndefined(value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], NearbyUsersQueryDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => emptyToUndefined(value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], NearbyUsersQueryDto.prototype, "foodType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => emptyToUndefined(value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], NearbyUsersQueryDto.prototype, "foodName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === true || value === 'true')
            return true;
        if (value === false || value === 'false')
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NearbyUsersQueryDto.prototype, "lookingToEat", void 0);
//# sourceMappingURL=location.dto.js.map