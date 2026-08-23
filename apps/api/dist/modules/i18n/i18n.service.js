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
exports.I18nService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@bitemate/shared");
const prisma_service_1 = require("../database/prisma.service");
const i18n_seed_data_1 = require("./i18n.seed-data");
let I18nService = class I18nService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.seedIfEmpty();
    }
    async getSupportedLocales() {
        return {
            locales: [...shared_1.SUPPORTED_LOCALES]
                .map((code) => ({
                code,
                label: shared_1.LOCALE_LABELS[code],
            }))
                .sort((a, b) => a.label.localeCompare(b.label, 'en')),
        };
    }
    async getBundle(locale) {
        const rows = await this.prisma.localizationKey.findMany({
            where: { locale },
        });
        const keys = rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});
        return { locale, keys };
    }
    async seedIfEmpty() {
        const count = await this.prisma.localizationKey.count();
        if (count > 0) {
            return;
        }
        const data = shared_1.SUPPORTED_LOCALES.flatMap((locale) => Object.entries(i18n_seed_data_1.BASE_I18N_KEYS).map(([key, translations]) => ({
            key,
            locale,
            value: translations[locale] ?? translations.en ?? key,
        })));
        await this.prisma.localizationKey.createMany({ data });
    }
};
exports.I18nService = I18nService;
exports.I18nService = I18nService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], I18nService);
//# sourceMappingURL=i18n.service.js.map