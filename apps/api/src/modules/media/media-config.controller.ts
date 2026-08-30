import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/auth.decorators';
import { MediaPublicUrlService } from './media-public-url.service';

@Controller('media')
export class MediaConfigController {
  constructor(private readonly mediaPublicUrl: MediaPublicUrlService) {}

  @Public()
  @Get('public-config')
  getPublicConfig(): { uploadsBaseUrl: string } {
    return {
      uploadsBaseUrl: this.mediaPublicUrl.getUploadsPublicBase(),
    };
  }
}
