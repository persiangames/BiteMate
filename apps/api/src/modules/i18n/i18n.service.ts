import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  type LocalizationBundleDto,
  type SupportedLocale,
  type SupportedLocalesResponseDto,
} from '@bitemate/shared';
import { PrismaService } from '../database/prisma.service';
import { BASE_I18N_KEYS } from './i18n.seed-data';

@Injectable()
export class I18nService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.seedIfEmpty();
  }

  async getSupportedLocales(): Promise<SupportedLocalesResponseDto> {
    return {
      locales: [...SUPPORTED_LOCALES]
        .map((code) => ({
          code,
          label: LOCALE_LABELS[code],
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'en')),
    };
  }

  async getBundle(locale: SupportedLocale): Promise<LocalizationBundleDto> {
    const rows = await this.prisma.localizationKey.findMany({
      where: { locale },
    });

    const keys = rows.reduce<Record<string, string>>((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    return { locale, keys };
  }

  private async seedIfEmpty(): Promise<void> {
    const count = await this.prisma.localizationKey.count();
    if (count > 0) {
      return;
    }

    const data = SUPPORTED_LOCALES.flatMap((locale) =>
      Object.entries(BASE_I18N_KEYS).map(([key, translations]) => ({
        key,
        locale,
        value: translations[locale] ?? translations.en ?? key,
      })),
    );

    await this.prisma.localizationKey.createMany({ data });
  }
}
