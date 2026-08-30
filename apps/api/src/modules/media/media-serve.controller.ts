import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { Request, Response } from 'express';
import { Public } from '../../common/decorators/auth.decorators';
import { contentTypeForUploadFilename } from '../../common/utils/media-mime.util';
import { MediaService } from './media.service';

@Controller('uploads')
export class MediaServeController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get(':filename')
  async serve(
    @Param('filename') filename: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    if (!filename || filename.includes('..') || filename.includes('/')) {
      throw new NotFoundException('Media not found');
    }

    const uploadDir = this.configService.get<string>('storage.localUploadDir', 'uploads');
    const localPath = join(process.cwd(), uploadDir, filename);

    if (existsSync(localPath)) {
      this.streamLocalFile(localPath, req, res);
      return;
    }

    if (this.mediaService.isS3Enabled()) {
      await this.streamS3File(filename, req, res);
      return;
    }

    throw new NotFoundException('Media not found');
  }

  private streamLocalFile(localPath: string, req: Request, res: Response): void {
    const stat = statSync(localPath);
    const range = req.headers.range;
    const filename = localPath.split(/[/\\]/).pop() ?? '';
    res.setHeader('Content-Type', contentTypeForUploadFilename(filename));
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    if (range) {
      const match = /bytes=(\d+)-(\d*)/.exec(range);
      if (match) {
        const start = Number.parseInt(match[1], 10);
        const end = match[2] ? Number.parseInt(match[2], 10) : stat.size - 1;
        if (start >= stat.size || end >= stat.size) {
          res.status(416).setHeader('Content-Range', `bytes */${stat.size}`).end();
          return;
        }
        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`);
        res.setHeader('Content-Length', String(end - start + 1));
        createReadStream(localPath, { start, end }).pipe(res);
        return;
      }
    }

    res.setHeader('Content-Length', String(stat.size));
    createReadStream(localPath).pipe(res);
  }

  private async streamS3File(filename: string, req: Request, res: Response): Promise<void> {
    const bucket = this.configService.get<string>('storage.awsS3Bucket')!;
    const key = this.mediaService.s3KeyFromLocalFilename(filename);
    const client = this.getS3Client();
    const range = req.headers.range;

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ...(range ? { Range: range } : {}),
    });

    const object = await client.send(command);
    if (!object.Body) {
      throw new NotFoundException('Media not found');
    }

    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    if (object.ContentType) {
      res.setHeader('Content-Type', object.ContentType);
    }
    if (object.ContentLength != null) {
      res.setHeader('Content-Length', String(object.ContentLength));
    }
    if (object.ContentRange) {
      res.status(206);
      res.setHeader('Content-Range', object.ContentRange);
    }

    const stream = object.Body as NodeJS.ReadableStream;
    stream.pipe(res);
  }

  private getS3Client(): S3Client {
    return new S3Client({
      region: this.configService.get<string>('storage.awsRegion'),
      credentials: {
        accessKeyId: this.configService.get<string>('storage.awsAccessKeyId')!,
        secretAccessKey: this.configService.get<string>('storage.awsSecretAccessKey')!,
      },
    });
  }
}
