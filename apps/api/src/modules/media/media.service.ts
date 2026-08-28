import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import type { MediaType } from '@bitemate/shared';

export interface ProcessedMedia {
  buffer: Buffer;
  mediaType: MediaType;
  extension: string;
  thumbnailBuffer?: Buffer;
  contentType?: string;
}

@Injectable()
export class MediaService {
  private s3Client: S3Client | null = null;

  constructor(private readonly configService: ConfigService) {}

  isS3Enabled(): boolean {
    return this.configService.get<string>('storage.provider') === 's3';
  }

  private getS3Client(): S3Client {
    if (!this.s3Client) {
      this.s3Client = new S3Client({
        region: this.configService.get<string>('storage.awsRegion'),
        credentials: {
          accessKeyId: this.configService.get<string>('storage.awsAccessKeyId')!,
          secretAccessKey: this.configService.get<string>('storage.awsSecretAccessKey')!,
        },
      });
    }

    return this.s3Client;
  }

  async processUpload(file: Express.Multer.File): Promise<ProcessedMedia> {
    const isVideo = file.mimetype.startsWith('video/');
    const mediaType: MediaType = isVideo ? 'VIDEO' : 'IMAGE';

    if (isVideo) {
      const extension = (extname(file.originalname) || '.mp4').toLowerCase();
      const contentType =
        file.mimetype ||
        (extension === '.webm'
          ? 'video/webm'
          : extension === '.mov'
            ? 'video/quicktime'
            : 'video/mp4');

      return {
        buffer: file.buffer,
        mediaType,
        extension,
        contentType,
      };
    }

    const compressed = await sharp(file.buffer)
      .rotate()
      .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    const thumbnail = await sharp(file.buffer)
      .rotate()
      .resize({ width: 480, height: 480, fit: 'cover' })
      .jpeg({ quality: 75, mozjpeg: true })
      .toBuffer();

    return {
      buffer: compressed,
      mediaType,
      extension: '.jpg',
      thumbnailBuffer: thumbnail,
    };
  }

  async processAudioUpload(file: Express.Multer.File): Promise<ProcessedMedia> {
    return {
      buffer: file.buffer,
      mediaType: 'VIDEO',
      extension: extname(file.originalname) || '.webm',
      contentType: file.mimetype,
    };
  }

  async processDocumentUpload(file: Express.Multer.File): Promise<ProcessedMedia> {
    return {
      buffer: file.buffer,
      mediaType: 'VIDEO',
      extension: extname(file.originalname) || '.bin',
      contentType: file.mimetype,
    };
  }

  async uploadProcessedMedia(processed: ProcessedMedia): Promise<{
    mediaUrl: string;
    thumbnailUrl: string | null;
    mediaType: MediaType;
  }> {
    const keyBase = `posts/${randomUUID()}`;
    const mediaKey = `${keyBase}${processed.extension}`;
    const thumbnailKey = processed.thumbnailBuffer ? `${keyBase}_thumb.jpg` : null;

    if (this.isS3Enabled()) {
      const bucket = this.configService.get<string>('storage.awsS3Bucket')!;
      const client = this.getS3Client();

      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: mediaKey,
          Body: processed.buffer,
          ContentType:
            processed.contentType ??
            (processed.mediaType === 'VIDEO' ? 'video/mp4' : 'image/jpeg'),
        }),
      );

      if (processed.thumbnailBuffer && thumbnailKey) {
        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: thumbnailKey,
            Body: processed.thumbnailBuffer,
            ContentType: 'image/jpeg',
          }),
        );
      }

      const region = this.configService.get<string>('storage.awsRegion');
      const mediaUrl = `https://${bucket}.s3.${region}.amazonaws.com/${mediaKey}`;
      const thumbnailUrl = thumbnailKey
        ? `https://${bucket}.s3.${region}.amazonaws.com/${thumbnailKey}`
        : null;

      return { mediaUrl, thumbnailUrl, mediaType: processed.mediaType };
    }

    const uploadDir = this.configService.get<string>('storage.localUploadDir', 'uploads');

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const mediaPath = join(uploadDir, mediaKey.replace(/\//g, '_'));
    writeFileSync(mediaPath, processed.buffer);

    if (processed.thumbnailBuffer && thumbnailKey) {
      const thumbPath = join(uploadDir, thumbnailKey.replace(/\//g, '_'));
      writeFileSync(thumbPath, processed.thumbnailBuffer);
    }

    const fileName = mediaKey.replace(/\//g, '_');
    const thumbFileName = thumbnailKey?.replace(/\//g, '_') ?? null;

    return {
      mediaUrl: `/uploads/${fileName}`,
      thumbnailUrl: thumbFileName ? `/uploads/${thumbFileName}` : null,
      mediaType: processed.mediaType,
    };
  }
}
