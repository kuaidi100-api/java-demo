import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import type { StorageObject, StorageProvider, StoredObject } from './provider.interfaces.js';

const require = createRequire(import.meta.url);
const OSSCtor = require('ali-oss') as new (options: Record<string, unknown>) => {
  put(key: string, data: Buffer, options?: Record<string, unknown>): Promise<unknown>;
  signatureUrl(key: string, options?: { expires?: number }): string;
};

const ALLOWED_MIME = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

@Injectable()
export class OssStorageProvider implements StorageProvider {
  private readonly logger = new Logger(OssStorageProvider.name);
  private readonly client: InstanceType<typeof OSSCtor>;
  private readonly bucket: string;
  private readonly publicHost: string;
  private readonly expires: number;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('OSS_BUCKET', '100kda');
    this.publicHost = this.config.get<string>('OSS_CNAME', 'oss.kapokstar.com').replace(/^https?:\/\//, '');
    this.expires = Number(this.config.get<string>('OSS_SIGNED_URL_EXPIRES') ?? 3600);
    const endpoint = this.config.get<string>('OSS_ENDPOINT', 'oss-cn-hongkong.aliyuncs.com');
    const accessKeyId = this.config.get<string>('OSS_ACCESS_KEY_ID', '');
    const accessKeySecret = this.config.get<string>('OSS_ACCESS_KEY_SECRET', '');
    this.client = new OSSCtor({
      accessKeyId: accessKeyId || 'unconfigured',
      accessKeySecret: accessKeySecret || 'unconfigured',
      bucket: this.bucket,
      endpoint,
      cname: false,
      secure: this.config.get<string>('OSS_SECURE', 'true') !== 'false',
      timeout: 60_000,
    });
  }

  async save(input: StorageObject): Promise<StoredObject> {
    const extension = ALLOWED_MIME.get(input.mimeType);
    if (!extension) throw new BadRequestException('仅支持 JPG、PNG、WebP 图片');
    const maxBytes = Number(this.config.get<string>('UPLOAD_MAX_BYTES') ?? 5_242_880);
    if (input.content.length > maxBytes) throw new BadRequestException('文件大小超过限制');

    const folder = input.folder ?? 'uploads';
    const storageKey = `${folder}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${extension}`;
    await this.client.put(storageKey, input.content, {
      mime: input.mimeType,
      headers: {
        'Content-Disposition': 'inline',
        'x-oss-object-acl': input.isPublic ? 'public-read' : 'private',
      },
    });
    this.logger.log(`oss put ${storageKey} (${input.content.length} bytes)`);
    return {
      storageKey,
      sizeBytes: input.content.length,
      publicUrl: input.isPublic ? this.publicUrl(storageKey) : undefined,
      signedUrl: await this.signedUrl(storageKey),
    };
  }

  publicUrl(storageKey: string): string {
    return `https://${this.publicHost}/${storageKey.replace(/^\//, '')}`;
  }

  async signedUrl(storageKey: string, expiresSeconds = this.expires): Promise<string> {
    const url = this.client.signatureUrl(storageKey, { expires: expiresSeconds });
    try {
      const parsed = new URL(url);
      parsed.host = this.publicHost;
      parsed.protocol = 'https:';
      return parsed.toString();
    } catch {
      return url;
    }
  }
}
