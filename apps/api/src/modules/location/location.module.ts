import { Module } from '@nestjs/common';
import { LocationController, NearbyUsersController } from './location.controller';
import { GeocodeController } from './geocode.controller';
import { GeocodeService } from './geocode.service';
import { LocationService } from './location.service';
import { GeoLocationService } from './geo-location.service';

@Module({
  controllers: [LocationController, NearbyUsersController, GeocodeController],
  providers: [LocationService, GeoLocationService, GeocodeService],
  exports: [LocationService, GeoLocationService, GeocodeService],
})
export class LocationModule {}
