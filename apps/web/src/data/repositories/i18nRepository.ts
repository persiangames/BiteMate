import type {
  LocalizationBundleDto,
  SupportedLocale,
  SupportedLocalesResponseDto,
} from '@bitemate/shared';
import { apiFetch } from '@/data/api/client';

export async function fetchLocales(): Promise<SupportedLocalesResponseDto> {
  return apiFetch<SupportedLocalesResponseDto>('/i18n/locales');
}

export async function fetchTranslations(
  locale: SupportedLocale,
): Promise<LocalizationBundleDto> {
  return apiFetch<LocalizationBundleDto>(`/i18n/${locale}`);
}
