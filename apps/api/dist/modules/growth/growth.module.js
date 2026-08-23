"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrowthModule = void 0;
const common_1 = require("@nestjs/common");
const notifications_module_1 = require("../notifications/notifications.module");
const wallet_module_1 = require("../wallet/wallet.module");
const gamification_controller_1 = require("./gamification.controller");
const gamification_service_1 = require("./gamification.service");
const monetization_controller_1 = require("./monetization.controller");
const monetization_service_1 = require("./monetization.service");
const premium_controller_1 = require("./premium.controller");
const premium_service_1 = require("./premium.service");
const ranking_cache_service_1 = require("./ranking-cache.service");
const ranking_controller_1 = require("./ranking.controller");
const ranking_service_1 = require("./ranking.service");
let GrowthModule = class GrowthModule {
};
exports.GrowthModule = GrowthModule;
exports.GrowthModule = GrowthModule = __decorate([
    (0, common_1.Module)({
        imports: [notifications_module_1.NotificationsModule, wallet_module_1.WalletModule],
        controllers: [ranking_controller_1.RankingController, premium_controller_1.PremiumController, monetization_controller_1.MonetizationController, gamification_controller_1.GamificationController],
        providers: [
            ranking_service_1.RankingService,
            ranking_cache_service_1.RankingCacheService,
            premium_service_1.PremiumService,
            monetization_service_1.MonetizationService,
            gamification_service_1.GamificationService,
        ],
        exports: [ranking_service_1.RankingService, premium_service_1.PremiumService, monetization_service_1.MonetizationService, gamification_service_1.GamificationService],
    })
], GrowthModule);
//# sourceMappingURL=growth.module.js.map