import { Controller, Get, Param } from '@nestjs/common';
import type {
  LocalizationBundleDto,
  SupportedLocale,
  SupportedLocalesResponseDto,
} from '@bitemate/shared';
import { Public } from '../../common/decorators/auth.decorators';
import { I18nService } from './i18n.service';

@Controller('i18n')
export class I18nController {
  constructor(private readonly i18nService: I18nService) {}

  @Public()
  @Get('locales')
  getLocales(): Promise<SupportedLocalesResponseDto> {
    return this.i18nService.getSupportedLocales();
  }

  @Public()
  @Get(':locale')
  getBundle(
    @Param('locale') locale: SupportedLocale,
  ): Promise<LocalizationBundleDto> {
    return this.i18nService.getBundle(locale);
  }
}
