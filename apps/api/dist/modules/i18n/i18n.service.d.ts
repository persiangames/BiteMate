import { OnModuleInit } from '@nestjs/common';
import { type LocalizationBundleDto, type SupportedLocale, type SupportedLocalesResponseDto } from '@bitemate/shared';
import { PrismaService } from '../database/prisma.service';
export declare class I18nService implements OnModuleInit {
    private readonly prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    getSupportedLocales(): Promise<SupportedLocalesResponseDto>;
    getBundle(locale: SupportedLocale): Promise<LocalizationBundleDto>;
    private seedIfEmpty;
}
