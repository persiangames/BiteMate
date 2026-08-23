"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsModule = void 0;
const common_1 = require("@nestjs/common");
const growth_module_1 = require("../growth/growth.module");
const location_module_1 = require("../location/location.module");
const notifications_module_1 = require("../notifications/notifications.module");
const posts_controller_1 = require("./posts.controller");
const social_controller_1 = require("./social.controller");
const posts_service_1 = require("./posts.service");
const pagination_helper_1 = require("./pagination.helper");
let PostsModule = class PostsModule {
};
exports.PostsModule = PostsModule;
exports.PostsModule = PostsModule = __decorate([
    (0, common_1.Module)({
        imports: [location_module_1.LocationModule, growth_module_1.GrowthModule, notifications_module_1.NotificationsModule], controllers: [posts_controller_1.PostsController, social_controller_1.SocialController],
        providers: [posts_service_1.PostsService, posts_service_1.FeedService, posts_service_1.SocialService, pagination_helper_1.PaginationHelper],
        exports: [posts_service_1.PostsService, posts_service_1.FeedService, posts_service_1.SocialService],
    })
], PostsModule);
//# sourceMappingURL=posts.module.js.map