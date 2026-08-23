import { Module } from '@nestjs/common';
import { GrowthModule } from '../growth/growth.module';
import { BookingsService } from './bookings.service';
import { HomeChefService } from './home-chef.service';
import { MarketplaceController } from './marketplace.controller';
import { RestaurantsService } from './restaurants.service';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [GrowthModule],
  controllers: [MarketplaceController],
  providers: [
    RestaurantsService,
    HomeChefService,
    BookingsService,
    ReviewsService,
  ],
})
export class MarketplaceModule {}
