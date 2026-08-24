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
exports.DeleteAccountConfirmDto = exports.DeleteAccountRequestDto = exports.UpdateThemeDto = exports.ChangePasswordDto = exports.DisableTwoFactorDto = exports.EnableTwoFactorDto = exports.OtpLoginVerifyDto = exports.OtpLoginRequestDto = exports.ResetPasswordDto = exports.ForgotPasswordDto = exports.VerifyTwoFactorDto = exports.VerifyContactChangeDto = exports.RequestContactChangeDto = exports.SearchUsersQueryDto = exports.UsernameQueryDto = exports.UpdateLocaleDto = exports.UpdateProfileDto = exports.VerifyOtpDto = exports.RequestOtpDto = exports.RefreshTokenDto = exports.FirebaseAuthDto = exports.LoginDto = exports.RegisterDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const shared_1 = require("@bitemate/shared");
class RegisterDto {
    channel;
    email;
    password;
    fullName;
    phoneNumber;
    country;
    city;
    dateOfBirth;
    role;
    locale;
    username;
    profileImage;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, class_validator_1.IsIn)(['email', 'phone']),
    __metadata("design:type", String)
], RegisterDto.prototype, "channel", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((dto) => dto.channel === 'email'),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((dto) => dto.channel === 'phone'),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\+[1-9]\d{7,14}$/),
    __metadata("design:type", String)
], RegisterDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(shared_1.USER_ROLES),
    __metadata("design:type", String)
], RegisterDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(shared_1.SUPPORTED_LOCALES),
    __metadata("design:type", String)
], RegisterDto.prototype, "locale", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "profileImage", void 0);
class LoginDto {
    identifier;
    password;
    locale;
}
exports.LoginDto = LoginDto;
__decorate([
    (0, class_transformer_1.Transform)(({ obj }) => obj.identifier ?? obj.email),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoginDto.prototype, "identifier", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.SUPPORTED_LOCALES),
    __metadata("design:type", String)
], LoginDto.prototype, "locale", void 0);
class FirebaseAuthDto {
    idToken;
    role;
    locale;
    phoneNumber;
    country;
    city;
    dateOfBirth;
    fullName;
    profileImage;
}
exports.FirebaseAuthDto = FirebaseAuthDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FirebaseAuthDto.prototype, "idToken", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.USER_ROLES),
    __metadata("design:type", String)
], FirebaseAuthDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.SUPPORTED_LOCALES),
    __metadata("design:type", String)
], FirebaseAuthDto.prototype, "locale", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\+[1-9]\d{7,14}$/),
    __metadata("design:type", String)
], FirebaseAuthDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FirebaseAuthDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FirebaseAuthDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], FirebaseAuthDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FirebaseAuthDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FirebaseAuthDto.prototype, "profileImage", void 0);
class RefreshTokenDto {
    refreshToken;
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
class RequestOtpDto {
    phoneNumber;
    email;
}
exports.RequestOtpDto = RequestOtpDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\+[1-9]\d{7,14}$/),
    __metadata("design:type", String)
], RequestOtpDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RequestOtpDto.prototype, "email", void 0);
class VerifyOtpDto {
    phoneNumber;
    email;
    code;
}
exports.VerifyOtpDto = VerifyOtpDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\+[1-9]\d{7,14}$/),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{6}$/),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "code", void 0);
class UpdateProfileDto {
    fullName;
    username;
    bio;
    country;
    city;
    dateOfBirth;
    role;
    profileImage;
    coverImage;
    locale;
    liveLocationEnabled;
    invisibleMode;
    availabilityStatus;
    liveLatitude;
    liveLongitude;
    gender;
    education;
    preferredMeals;
    favoriteCuisines;
    favoriteFoods;
    lookingToEat;
}
exports.UpdateProfileDto = UpdateProfileDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9_]{3,30}$/),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "bio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.USER_ROLES),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "profileImage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "coverImage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.SUPPORTED_LOCALES),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "locale", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateProfileDto.prototype, "liveLocationEnabled", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateProfileDto.prototype, "invisibleMode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.AVAILABILITY_STATUSES),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "availabilityStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], UpdateProfileDto.prototype, "liveLatitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], UpdateProfileDto.prototype, "liveLongitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.GENDERS),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.EDUCATION_LEVELS),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "education", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(shared_1.MEAL_SLOTS, { each: true }),
    __metadata("design:type", Array)
], UpdateProfileDto.prototype, "preferredMeals", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.ArrayMaxSize)(20),
    __metadata("design:type", Array)
], UpdateProfileDto.prototype, "favoriteCuisines", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.ArrayMaxSize)(20),
    __metadata("design:type", Array)
], UpdateProfileDto.prototype, "favoriteFoods", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateProfileDto.prototype, "lookingToEat", void 0);
class UpdateLocaleDto {
    locale;
}
exports.UpdateLocaleDto = UpdateLocaleDto;
__decorate([
    (0, class_validator_1.IsEnum)(shared_1.SUPPORTED_LOCALES),
    __metadata("design:type", String)
], UpdateLocaleDto.prototype, "locale", void 0);
class UsernameQueryDto {
    username;
}
exports.UsernameQueryDto = UsernameQueryDto;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9_]{3,30}$/),
    __metadata("design:type", String)
], UsernameQueryDto.prototype, "username", void 0);
class SearchUsersQueryDto {
    q;
}
exports.SearchUsersQueryDto = SearchUsersQueryDto;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim().replace(/^@/, '') : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(30),
    __metadata("design:type", String)
], SearchUsersQueryDto.prototype, "q", void 0);
class RequestContactChangeDto {
    channel;
    value;
}
exports.RequestContactChangeDto = RequestContactChangeDto;
__decorate([
    (0, class_validator_1.IsIn)(['email', 'phone']),
    __metadata("design:type", String)
], RequestContactChangeDto.prototype, "channel", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RequestContactChangeDto.prototype, "value", void 0);
class VerifyContactChangeDto {
    channel;
    value;
    code;
}
exports.VerifyContactChangeDto = VerifyContactChangeDto;
__decorate([
    (0, class_validator_1.IsIn)(['email', 'phone']),
    __metadata("design:type", String)
], VerifyContactChangeDto.prototype, "channel", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyContactChangeDto.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{6}$/),
    __metadata("design:type", String)
], VerifyContactChangeDto.prototype, "code", void 0);
class VerifyTwoFactorDto {
    challengeToken;
    code;
}
exports.VerifyTwoFactorDto = VerifyTwoFactorDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyTwoFactorDto.prototype, "challengeToken", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{6}$/),
    __metadata("design:type", String)
], VerifyTwoFactorDto.prototype, "code", void 0);
class ForgotPasswordDto {
    identifier;
}
exports.ForgotPasswordDto = ForgotPasswordDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "identifier", void 0);
class ResetPasswordDto {
    identifier;
    code;
    newPassword;
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "identifier", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{6}$/),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
class OtpLoginRequestDto {
    destination;
}
exports.OtpLoginRequestDto = OtpLoginRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OtpLoginRequestDto.prototype, "destination", void 0);
class OtpLoginVerifyDto {
    destination;
    code;
    locale;
}
exports.OtpLoginVerifyDto = OtpLoginVerifyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OtpLoginVerifyDto.prototype, "destination", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{6}$/),
    __metadata("design:type", String)
], OtpLoginVerifyDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.SUPPORTED_LOCALES),
    __metadata("design:type", String)
], OtpLoginVerifyDto.prototype, "locale", void 0);
class EnableTwoFactorDto {
    code;
}
exports.EnableTwoFactorDto = EnableTwoFactorDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{6}$/),
    __metadata("design:type", String)
], EnableTwoFactorDto.prototype, "code", void 0);
class DisableTwoFactorDto {
    password;
    code;
}
exports.DisableTwoFactorDto = DisableTwoFactorDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], DisableTwoFactorDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{6}$/),
    __metadata("design:type", String)
], DisableTwoFactorDto.prototype, "code", void 0);
class ChangePasswordDto {
    currentPassword;
    newPassword;
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
class UpdateThemeDto {
    theme;
}
exports.UpdateThemeDto = UpdateThemeDto;
__decorate([
    (0, class_validator_1.IsIn)(['light', 'dark']),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "theme", void 0);
class DeleteAccountRequestDto {
    password;
    confirmation;
    channel;
}
exports.DeleteAccountRequestDto = DeleteAccountRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], DeleteAccountRequestDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^DELETE$/i),
    __metadata("design:type", String)
], DeleteAccountRequestDto.prototype, "confirmation", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['email', 'phone']),
    __metadata("design:type", String)
], DeleteAccountRequestDto.prototype, "channel", void 0);
class DeleteAccountConfirmDto {
    channel;
    code;
}
exports.DeleteAccountConfirmDto = DeleteAccountConfirmDto;
__decorate([
    (0, class_validator_1.IsIn)(['email', 'phone']),
    __metadata("design:type", String)
], DeleteAccountConfirmDto.prototype, "channel", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{6}$/),
    __metadata("design:type", String)
], DeleteAccountConfirmDto.prototype, "code", void 0);
//# sourceMappingURL=auth.dto.js.map