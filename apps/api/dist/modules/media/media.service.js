"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const node_crypto_1 = require("node:crypto");
const sharp_1 = __importDefault(require("sharp"));
let MediaService = class MediaService {
    configService;
    s3Client = null;
    constructor(configService) {
        this.configService = configService;
    }
    isS3Enabled() {
        return this.configService.get('storage.provider') === 's3';
    }
    getS3Client() {
        if (!this.s3Client) {
            this.s3Client = new client_s3_1.S3Client({
                region: this.configService.get('storage.awsRegion'),
                credentials: {
                    accessKeyId: this.configService.get('storage.awsAccessKeyId'),
                    secretAccessKey: this.configService.get('storage.awsSecretAccessKey'),
                },
            });
        }
        return this.s3Client;
    }
    async processUpload(file) {
        const isVideo = file.mimetype.startsWith('video/');
        const mediaType = isVideo ? 'VIDEO' : 'IMAGE';
        if (isVideo) {
            return {
                buffer: file.buffer,
                mediaType,
                extension: (0, node_path_1.extname)(file.originalname) || '.mp4',
            };
        }
        const compressed = await (0, sharp_1.default)(file.buffer)
            .rotate()
            .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 82, mozjpeg: true })
            .toBuffer();
        const thumbnail = await (0, sharp_1.default)(file.buffer)
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
    async processAudioUpload(file) {
        return {
            buffer: file.buffer,
            mediaType: 'VIDEO',
            extension: (0, node_path_1.extname)(file.originalname) || '.webm',
            contentType: file.mimetype,
        };
    }
    async uploadProcessedMedia(processed) {
        const keyBase = `posts/${(0, node_crypto_1.randomUUID)()}`;
        const mediaKey = `${keyBase}${processed.extension}`;
        const thumbnailKey = processed.thumbnailBuffer ? `${keyBase}_thumb.jpg` : null;
        if (this.isS3Enabled()) {
            const bucket = this.configService.get('storage.awsS3Bucket');
            const client = this.getS3Client();
            await client.send(new client_s3_1.PutObjectCommand({
                Bucket: bucket,
                Key: mediaKey,
                Body: processed.buffer,
                ContentType: processed.contentType ??
                    (processed.mediaType === 'VIDEO' ? 'video/mp4' : 'image/jpeg'),
            }));
            if (processed.thumbnailBuffer && thumbnailKey) {
                await client.send(new client_s3_1.PutObjectCommand({
                    Bucket: bucket,
                    Key: thumbnailKey,
                    Body: processed.thumbnailBuffer,
                    ContentType: 'image/jpeg',
                }));
            }
            const region = this.configService.get('storage.awsRegion');
            const mediaUrl = `https://${bucket}.s3.${region}.amazonaws.com/${mediaKey}`;
            const thumbnailUrl = thumbnailKey
                ? `https://${bucket}.s3.${region}.amazonaws.com/${thumbnailKey}`
                : null;
            return { mediaUrl, thumbnailUrl, mediaType: processed.mediaType };
        }
        const uploadDir = this.configService.get('storage.localUploadDir', 'uploads');
        const publicBaseUrl = this.configService.get('storage.publicBaseUrl', 'http://localhost:3000/uploads');
        if (!(0, node_fs_1.existsSync)(uploadDir)) {
            (0, node_fs_1.mkdirSync)(uploadDir, { recursive: true });
        }
        const mediaPath = (0, node_path_1.join)(uploadDir, mediaKey.replace(/\//g, '_'));
        (0, node_fs_1.writeFileSync)(mediaPath, processed.buffer);
        let thumbnailUrl = null;
        if (processed.thumbnailBuffer && thumbnailKey) {
            const thumbPath = (0, node_path_1.join)(uploadDir, thumbnailKey.replace(/\//g, '_'));
            (0, node_fs_1.writeFileSync)(thumbPath, processed.thumbnailBuffer);
            thumbnailUrl = `${publicBaseUrl}/${thumbnailKey.replace(/\//g, '_')}`;
        }
        return {
            mediaUrl: `${publicBaseUrl}/${mediaKey.replace(/\//g, '_')}`,
            thumbnailUrl,
            mediaType: processed.mediaType,
        };
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MediaService);
//# sourceMappingURL=media.service.js.map