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
exports.SendRoomMessageDto = exports.RespondMeetupInviteDto = exports.SendMeetupInviteDto = exports.MeetupMatchQueryDto = exports.NearbyMeetupsQueryDto = exports.CreateMeetupDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const shared_1 = require("@bitemate/shared");
function emptyToUndefined(value) {
    if (value === '' || value === null || value === undefined) {
        return undefined;
    }
    return value;
}
class CreateMeetupDto {
    foodType;
    foodCategory;
    scheduledAt;
    radiusKm;
    desiredPeople;
    latitude;
    longitude;
    locationLabel;
    notes;
    mealSlot;
    foodName;
    preferredGender;
    ageMin;
    ageMax;
    preferredEducation;
    country;
    city;
}
exports.CreateMeetupDto = CreateMeetupDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateMeetupDto.prototype, "foodType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(60),
    __metadata("design:type", String)
], CreateMeetupDto.prototype, "foodCategory", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMeetupDto.prototype, "scheduledAt", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.5),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateMeetupDto.prototype, "radiusKm", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], CreateMeetupDto.prototype, "desiredPeople", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], CreateMeetupDto.prototype, "latitude", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], CreateMeetupDto.prototype, "longitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateMeetupDto.prototype, "locationLabel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateMeetupDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.MEAL_SLOTS),
    __metadata("design:type", String)
], CreateMeetupDto.prototype, "mealSlot", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], CreateMeetupDto.prototype, "foodName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.GENDERS),
    __metadata("design:type", String)
], CreateMeetupDto.prototype, "preferredGender", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(18),
    (0, class_validator_1.Max)(99),
    __metadata("design:type", Number)
], CreateMeetupDto.prototype, "ageMin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(18),
    (0, class_validator_1.Max)(99),
    __metadata("design:type", Number)
], CreateMeetupDto.prototype, "ageMax", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.EDUCATION_LEVELS),
    __metadata("design:type", String)
], CreateMeetupDto.prototype, "preferredEducation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], CreateMeetupDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], CreateMeetupDto.prototype, "city", void 0);
class NearbyMeetupsQueryDto {
    latitude;
    longitude;
    radiusKm = 10;
    mealSlot;
    country;
    city;
    foodType;
    foodName;
    gender;
    education;
    ageMin;
    ageMax;
}
exports.NearbyMeetupsQueryDto = NearbyMeetupsQueryDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], NearbyMeetupsQueryDto.prototype, "latitude", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], NearbyMeetupsQueryDto.prototype, "longitude", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], NearbyMeetupsQueryDto.prototype, "radiusKm", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => emptyToUndefined(value)),
    (0, class_validator_1.IsEnum)(shared_1.MEAL_SLOTS),
    __metadata("design:type", String)
], NearbyMeetupsQueryDto.prototype, "mealSlot", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => emptyToUndefined(value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], NearbyMeetupsQueryDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => emptyToUndefined(value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], NearbyMeetupsQueryDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => emptyToUndefined(value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], NearbyMeetupsQueryDto.prototype, "foodType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => emptyToUndefined(value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], NearbyMeetupsQueryDto.prototype, "foodName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => emptyToUndefined(value)),
    (0, class_validator_1.IsEnum)(shared_1.GENDERS),
    __metadata("design:type", String)
], NearbyMeetupsQueryDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => emptyToUndefined(value)),
    (0, class_validator_1.IsEnum)(shared_1.EDUCATION_LEVELS),
    __metadata("design:type", String)
], NearbyMeetupsQueryDto.prototype, "education", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => emptyToUndefined(value)),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(18),
    (0, class_validator_1.Max)(99),
    __metadata("design:type", Number)
], NearbyMeetupsQueryDto.prototype, "ageMin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => emptyToUndefined(value)),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(18),
    (0, class_validator_1.Max)(99),
    __metadata("design:type", Number)
], NearbyMeetupsQueryDto.prototype, "ageMax", void 0);
class MeetupMatchQueryDto {
    meetupId;
}
exports.MeetupMatchQueryDto = MeetupMatchQueryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MeetupMatchQueryDto.prototype, "meetupId", void 0);
class SendMeetupInviteDto {
    meetupId;
    inviteeId;
}
exports.SendMeetupInviteDto = SendMeetupInviteDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMeetupInviteDto.prototype, "meetupId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMeetupInviteDto.prototype, "inviteeId", void 0);
class RespondMeetupInviteDto {
    inviteId;
}
exports.RespondMeetupInviteDto = RespondMeetupInviteDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RespondMeetupInviteDto.prototype, "inviteId", void 0);
class SendRoomMessageDto {
    content;
}
exports.SendRoomMessageDto = SendRoomMessageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], SendRoomMessageDto.prototype, "content", void 0);
//# sourceMappingURL=meetups.dto.js.map