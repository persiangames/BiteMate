"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceModule = void 0;
const common_1 = require("@nestjs/common");
const growth_module_1 = require("../growth/growth.module");
const bookings_service_1 = require("./bookings.service");
const home_chef_service_1 = require("./home-chef.service");
const marketplace_controller_1 = require("./marketplace.controller");
const restaurants_service_1 = require("./restaurants.service");
const reviews_service_1 = require("./reviews.service");
let MarketplaceModule = class MarketplaceModule {
};
exports.MarketplaceModule = MarketplaceModule;
exports.MarketplaceModule = MarketplaceModule = __decorate([
    (0, common_1.Module)({
        imports: [growth_module_1.GrowthModule],
        controllers: [marketplace_controller_1.MarketplaceController],
        providers: [
            restaurants_service_1.RestaurantsService,
            home_chef_service_1.HomeChefService,
            bookings_service_1.BookingsService,
            reviews_service_1.ReviewsService,
        ],
    })
], MarketplaceModule);
//# sourceMappingURL=marketplace.module.js.map