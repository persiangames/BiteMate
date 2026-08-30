import { Global, Module } from '@nestjs/common';
import { MediaConfigController } from './media-config.controller';
import { MediaController } from './media.controller';
import { MediaPublicUrlService } from './media-public-url.service';
import { MediaServeController } from './media-serve.controller';
import { MediaService } from './media.service';

@Global()
@Module({
  controllers: [MediaController, MediaServeController, MediaConfigController],
  providers: [MediaService, MediaPublicUrlService],
  exports: [MediaService, MediaPublicUrlService],
})
export class MediaModule {}
