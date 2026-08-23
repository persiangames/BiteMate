import { ConfigService } from '@nestjs/config';
import type { MediaType } from '@bitemate/shared';
export interface ProcessedMedia {
    buffer: Buffer;
    mediaType: MediaType;
    extension: string;
    thumbnailBuffer?: Buffer;
    contentType?: string;
}
export declare class MediaService {
    private readonly configService;
    private s3Client;
    constructor(configService: ConfigService);
    isS3Enabled(): boolean;
    private getS3Client;
    processUpload(file: Express.Multer.File): Promise<ProcessedMedia>;
    processAudioUpload(file: Express.Multer.File): Promise<ProcessedMedia>;
    uploadProcessedMedia(processed: ProcessedMedia): Promise<{
        mediaUrl: string;
        thumbnailUrl: string | null;
        mediaType: MediaType;
    }>;
}
