import type { LocalizationBundleDto, SupportedLocale, SupportedLocalesResponseDto } from '@bitemate/shared';
import { I18nService } from './i18n.service';
export declare class I18nController {
    private readonly i18nService;
    constructor(i18nService: I18nService);
    getLocales(): Promise<SupportedLocalesResponseDto>;
    getBundle(locale: SupportedLocale): Promise<LocalizationBundleDto>;
}
