import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resolvePublicMediaUrl } from '../../common/media-url';

@Injectable()
export class MediaPublicUrlService {
  private readonly uploadsPublicBase: string;
  private readonly appPublicUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadsPublicBase =
      this.configService.get<string>('storage.publicBaseUrl') ?? 'http://localhost:3000/api/uploads';
    this.appPublicUrl =
      this.configService.get<string>('messaging.appUrl') ?? 'https://www.bitemate.ir';
  }

  resolve(url: string | null | undefined): string | null {
    return resolvePublicMediaUrl(url, this.uploadsPublicBase, this.appPublicUrl);
  }

  getUploadsPublicBase(): string {
    return this.uploadsPublicBase;
  }
}
