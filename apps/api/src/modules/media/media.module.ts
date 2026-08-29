import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaServeController } from './media-serve.controller';
import { MediaService } from './media.service';

@Module({
  controllers: [MediaController, MediaServeController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
