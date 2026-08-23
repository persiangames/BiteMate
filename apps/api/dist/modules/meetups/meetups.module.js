"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetupsModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const chat_module_1 = require("../chat/chat.module");
const location_module_1 = require("../location/location.module");
const realtime_module_1 = require("../realtime/realtime.module");
const growth_module_1 = require("../growth/growth.module");
const notifications_module_1 = require("../notifications/notifications.module");
const meetup_cache_service_1 = require("./meetup-cache.service");
const meetup_matching_service_1 = require("./meetup-matching.service");
const meetups_controller_1 = require("./meetups.controller");
const meetups_service_1 = require("./meetups.service");
const skipMongo = process.env.SKIP_MONGO === 'true';
let MeetupsModule = class MeetupsModule {
};
exports.MeetupsModule = MeetupsModule;
exports.MeetupsModule = MeetupsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            location_module_1.LocationModule,
            realtime_module_1.RealtimeModule,
            growth_module_1.GrowthModule,
            notifications_module_1.NotificationsModule,
            ...(skipMongo ? [] : [(0, common_1.forwardRef)(() => chat_module_1.ChatModule)]),
        ],
        controllers: [meetups_controller_1.MeetupsController],
        providers: [meetups_service_1.MeetupsService, meetup_cache_service_1.MeetupCacheService, meetup_matching_service_1.MeetupMatchingService],
        exports: [meetup_cache_service_1.MeetupCacheService, meetup_matching_service_1.MeetupMatchingService],
    })
], MeetupsModule);
//# sourceMappingURL=meetups.module.js.map