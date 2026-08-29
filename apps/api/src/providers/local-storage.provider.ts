import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { StorageProvider } from './provider.interfaces.js';

const ALLOWED_MIME = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  constructor(private readonly config: ConfigService) {}

  async save(input: Parameters<StorageProvider['save']>[0]) {
    const extension = ALLOWED_MIME.get(input.mimeType);
    if (!extension) throw new BadRequestException('仅支持 JPG、PNG、WebP 图片');
    const maxBytes = Number(this.config.get<string>('UPLOAD_MAX_BYTES') ?? 5_242_880);
    if (input.content.length > maxBytes) throw new BadRequestException('文件大小超过限制');

    const baseDir = resolve(this.config.get<string>('UPLOAD_DIR') ?? 'uploads');
    await mkdir(baseDir, { recursive: true });
    const storageKey = `${randomUUID()}${extension}`;
    await writeFile(join(baseDir, storageKey), input.content, { flag: 'wx' });
    return { storageKey, sizeBytes: input.content.length };
  }
}
