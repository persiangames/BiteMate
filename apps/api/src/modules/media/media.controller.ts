import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { MediaUploadResponseDto } from '@bitemate/shared';
import { RequireOtpVerified } from '../../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OtpVerifiedGuard } from '../../common/guards/otp-verified.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { MediaService } from './media.service';

@Controller('media')
@UseGuards(JwtAuthGuard, OtpVerifiedGuard, RolesGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @RequireOtpVerified()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File): Promise<MediaUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('Media file is required');
    }

    const allowed = ['image/', 'video/', 'audio/', 'application/', 'text/'];
    if (!allowed.some((prefix) => file.mimetype.startsWith(prefix))) {
      throw new BadRequestException('Only image, video, and audio uploads are supported');
    }

    if (file.mimetype.startsWith('audio/')) {
      const processed = await this.mediaService.processAudioUpload(file);
      return this.mediaService.uploadProcessedMedia(processed);
    }

    if (
      file.mimetype.startsWith('application/') ||
      (file.mimetype.startsWith('text/') && !file.mimetype.startsWith('text/html'))
    ) {
      const processed = await this.mediaService.processDocumentUpload(file);
      return this.mediaService.uploadProcessedMedia(processed);
    }

    const processed = await this.mediaService.processUpload(file);
    return this.mediaService.uploadProcessedMedia(processed);
  }
}
