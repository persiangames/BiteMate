import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GeocodeService } from './geocode.service';

class GeoSearchQueryDto {
  @IsString()
  @MaxLength(120)
  q!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  country?: string;
}

class GeoReverseQueryDto {
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lon!: number;
}

class GeoCityQueryDto {
  @IsString()
  @MaxLength(120)
  country!: string;

  @IsString()
  @MaxLength(120)
  city!: string;
}

@Controller('geo')
@UseGuards(JwtAuthGuard)
export class GeocodeController {
  constructor(private readonly geocodeService: GeocodeService) {}

  @Get('search')
  search(@Query() query: GeoSearchQueryDto) {
    return this.geocodeService.searchPlaces(query.q, query.country);
  }

  @Get('reverse')
  reverse(@Query() query: GeoReverseQueryDto) {
    return this.geocodeService.reverseGeocode(query.lat, query.lon);
  }

  @Get('city')
  city(@Query() query: GeoCityQueryDto) {
    return this.geocodeService.geocodeCity(query.country, query.city);
  }
}
