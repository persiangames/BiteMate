import { Module } from '@nestjs/common';
import { LocationController, NearbyUsersController } from './location.controller';
import { LocationService } from './location.service';
import { GeoLocationService } from './geo-location.service';

@Module({
  controllers: [LocationController, NearbyUsersController],
  providers: [LocationService, GeoLocationService],
  exports: [LocationService, GeoLocationService],
})
export class LocationModule {}
