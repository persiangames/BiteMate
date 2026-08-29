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

export interface ProcessUploadOptions {
  /** Preserve more detail for profile/cover photos (4096px, q95). */
  highQuality?: boolean;
}

@Injectable()
export class MediaService {
  private s3Client: S3Client | null = null;

  constructor(private readonly configService: ConfigService) {}

  isS3Enabled(): boolean {
    return this.configService.get<string>('storage.provider') === 's3';
  }

  /** Convert a flat local filename back to the S3 object key. */
  s3KeyFromLocalFilename(filename: string): string {
    if (filename.startsWith('posts_')) {
      return filename.replace(/^posts_/, 'posts/');
    }
    return filename;
  }

  /** Build a browser-safe relative URL for any stored object key. */
  toPublicUploadPath(key: string): string {
    return `/uploads/${key.replace(/\//g, '_')}`;
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

  async processUpload(
    file: Express.Multer.File,
    options?: ProcessUploadOptions,
  ): Promise<ProcessedMedia> {
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

    const highQuality = options?.highQuality ?? false;
    const maxWidth = highQuality ? 4096 : 2560;
    const jpegQuality = highQuality ? 95 : 88;

    const metadata = await sharp(file.buffer).metadata();
    const withinBounds =
      (metadata.width ?? 0) <= maxWidth && (metadata.height ?? 0) <= maxWidth;

    let buffer: Buffer;
    let extension = '.jpg';
    let contentType = 'image/jpeg';

    if (highQuality && withinBounds && file.mimetype === 'image/png') {
      buffer = await sharp(file.buffer).rotate().png({ compressionLevel: 6 }).toBuffer();
      extension = '.png';
      contentType = 'image/png';
    } else if (highQuality && withinBounds && file.mimetype === 'image/webp') {
      buffer = await sharp(file.buffer).rotate().webp({ quality: 95 }).toBuffer();
      extension = '.webp';
      contentType = 'image/webp';
    } else {
      buffer = await sharp(file.buffer)
        .rotate()
        .resize({ width: maxWidth, height: maxWidth, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: jpegQuality, mozjpeg: true })
        .toBuffer();
    }

    const thumbnail = await sharp(file.buffer)
      .rotate()
      .resize({ width: 720, height: 720, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    return {
      buffer,
      mediaType,
      extension,
      thumbnailBuffer: thumbnail,
      contentType,
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
    } else {
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
    }

    return {
      mediaUrl: this.toPublicUploadPath(mediaKey),
      thumbnailUrl: thumbnailKey ? this.toPublicUploadPath(thumbnailKey) : null,
      mediaType: processed.mediaType,
    };
  }
}
