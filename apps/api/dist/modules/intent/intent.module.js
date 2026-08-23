"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntentModule = void 0;
const common_1 = require("@nestjs/common");
const location_module_1 = require("../location/location.module");
const growth_module_1 = require("../growth/growth.module");
const meetups_module_1 = require("../meetups/meetups.module");
const notifications_module_1 = require("../notifications/notifications.module");
const intent_cache_service_1 = require("./intent-cache.service");
const intent_matching_service_1 = require("./intent-matching.service");
const intent_controller_1 = require("./intent.controller");
const intent_service_1 = require("./intent.service");
let IntentModule = class IntentModule {
};
exports.IntentModule = IntentModule;
exports.IntentModule = IntentModule = __decorate([
    (0, common_1.Module)({
        imports: [location_module_1.LocationModule, meetups_module_1.MeetupsModule, notifications_module_1.NotificationsModule, growth_module_1.GrowthModule],
        controllers: [intent_controller_1.IntentController],
        providers: [intent_service_1.IntentService, intent_cache_service_1.IntentCacheService, intent_matching_service_1.IntentMatchingService],
        exports: [intent_service_1.IntentService, intent_cache_service_1.IntentCacheService, intent_matching_service_1.IntentMatchingService],
    })
], IntentModule);
//# sourceMappingURL=intent.module.js.map