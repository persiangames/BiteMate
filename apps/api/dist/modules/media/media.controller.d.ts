import type { MediaUploadResponseDto } from '@bitemate/shared';
import { MediaService } from './media.service';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    upload(file: Express.Multer.File): Promise<MediaUploadResponseDto>;
}
