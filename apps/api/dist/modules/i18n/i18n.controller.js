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
exports.I18nController = void 0;
const common_1 = require("@nestjs/common");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const i18n_service_1 = require("./i18n.service");
let I18nController = class I18nController {
    i18nService;
    constructor(i18nService) {
        this.i18nService = i18nService;
    }
    getLocales() {
        return this.i18nService.getSupportedLocales();
    }
    getBundle(locale) {
        return this.i18nService.getBundle(locale);
    }
};
exports.I18nController = I18nController;
__decorate([
    (0, auth_decorators_1.Public)(),
    (0, common_1.Get)('locales'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], I18nController.prototype, "getLocales", null);
__decorate([
    (0, auth_decorators_1.Public)(),
    (0, common_1.Get)(':locale'),
    __param(0, (0, common_1.Param)('locale')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], I18nController.prototype, "getBundle", null);
exports.I18nController = I18nController = __decorate([
    (0, common_1.Controller)('i18n'),
    __metadata("design:paramtypes", [i18n_service_1.I18nService])
], I18nController);
//# sourceMappingURL=i18n.controller.js.map