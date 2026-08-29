import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcryptjs';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from 'node:crypto';

@Injectable()
export class SecurityService {
  constructor(private readonly config: ConfigService) {}

  normalizePhone(phone: string): string {
    return phone.replace(/[\s()-]/g, '');
  }

  hashPhone(phone: string): string {
    return createHmac('sha256', this.config.getOrThrow<string>('PHONE_HASH_KEY'))
      .update(this.normalizePhone(phone))
      .digest('hex');
  }

  hashOpaqueToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  encryptField(value: string): string {
    const key = this.encryptionKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${encrypted.toString('base64url')}`;
  }

  decryptField(value: string): string {
    const [ivPart, tagPart, encryptedPart] = value.split('.');
    if (!ivPart || !tagPart || !encryptedPart) throw new Error('Invalid encrypted field');
    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey(),
      Buffer.from(ivPart, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
    return Buffer.concat([
      decipher.update(Buffer.from(encryptedPart, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  }

  maskPhone(last4: string): string {
    return `******${last4}`;
  }

  hashPassword(password: string): Promise<string> {
    return hash(password, 12);
  }

  verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    return compare(password, passwordHash);
  }

  createRefreshSecret(): string {
    return randomBytes(48).toString('base64url');
  }

  private encryptionKey(): Buffer {
    const key = Buffer.from(this.config.getOrThrow<string>('FIELD_ENCRYPTION_KEY'), 'hex');
    if (key.length !== 32) throw new Error('Invalid FIELD_ENCRYPTION_KEY');
    return key;
  }
}
