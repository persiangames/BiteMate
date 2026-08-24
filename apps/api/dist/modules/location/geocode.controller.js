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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeocodeController = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const geocode_service_1 = require("./geocode.service");
class GeoSearchQueryDto {
    q;
    country;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], GeoSearchQueryDto.prototype, "q", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], GeoSearchQueryDto.prototype, "country", void 0);
class GeoReverseQueryDto {
    lat;
    lon;
}
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], GeoReverseQueryDto.prototype, "lat", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], GeoReverseQueryDto.prototype, "lon", void 0);
class GeoCityQueryDto {
    country;
    city;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], GeoCityQueryDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], GeoCityQueryDto.prototype, "city", void 0);
let GeocodeController = class GeocodeController {
    geocodeService;
    constructor(geocodeService) {
        this.geocodeService = geocodeService;
    }
    search(query) {
        return this.geocodeService.searchPlaces(query.q, query.country);
    }
    reverse(query) {
        return this.geocodeService.reverseGeocode(query.lat, query.lon);
    }
    city(query) {
        return this.geocodeService.geocodeCity(query.country, query.city);
    }
};
exports.GeocodeController = GeocodeController;
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GeoSearchQueryDto]),
    __metadata("design:returntype", void 0)
], GeocodeController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('reverse'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GeoReverseQueryDto]),
    __metadata("design:returntype", void 0)
], GeocodeController.prototype, "reverse", null);
__decorate([
    (0, common_1.Get)('city'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GeoCityQueryDto]),
    __metadata("design:returntype", void 0)
], GeocodeController.prototype, "city", null);
exports.GeocodeController = GeocodeController = __decorate([
    (0, common_1.Controller)('geo'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [geocode_service_1.GeocodeService])
], GeocodeController);
//# sourceMappingURL=geocode.controller.js.map