import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { STORAGE_PROVIDER, type StorageProvider } from '../providers/provider.interfaces.js';

class SignedUrlQuery {
  @IsString()
  key!: string;

  @IsOptional()
  @IsString()
  expires?: string;
}

@ApiTags('对象存储')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('storage')
export class StorageController {
  constructor(@Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5_242_880 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' }, folder: { type: 'string' } } } })
  @ApiOperation({ summary: '上传图片到 OSS（或本地回退），返回签名临时 URL' })
  async upload(
    @UploadedFile() file: { buffer: Buffer; mimetype: string; originalname: string; size: number } | undefined,
    @Body() body: { folder?: string },
  ) {
    if (!file) {
      return { accepted: false, message: '请选择图片文件' };
    }
    const saved = await this.storage.save({
      content: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
      folder: body.folder || 'proofs',
      isPublic: false,
    });
    const signedUrl = saved.signedUrl ?? (await this.storage.signedUrl?.(saved.storageKey));
    return {
      ...saved,
      url: signedUrl ?? saved.publicUrl,
      host: 'https://oss.kapokstar.com',
    };
  }

  @Get('signed-url')
  @ApiOperation({ summary: '按 storageKey 生成带签名的临时访问链接' })
  async signed(@Query() query: SignedUrlQuery) {
    const expires = query.expires ? Number(query.expires) : undefined;
    const url = (await this.storage.signedUrl?.(query.key, expires))
      ?? this.storage.publicUrl?.(query.key)
      ?? `https://oss.kapokstar.com/${query.key}`;
    return { key: query.key, url, expires: expires ?? 3600 };
  }
}
