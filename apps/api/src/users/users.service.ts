import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrincipalType } from '@prisma/client';
import type { AuthPrincipal } from '../common/types/auth-principal.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SecurityService } from '../security/security.service.js';
import type { CreateAddressDto } from './dto/create-address.dto.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly security: SecurityService,
  ) {}

  async profile(principal: AuthPrincipal) {
    this.ensureUser(principal);
    const user = await this.prisma.user.findUnique({ where: { id: principal.id } });
    if (!user) throw new NotFoundException('用户不存在');
    return {
      id: user.id,
      displayName: user.displayName,
      phone: this.security.maskPhone(user.phoneLast4),
      status: user.status,
      createdAt: user.createdAt,
    };
  }

  async listAddresses(principal: AuthPrincipal) {
    this.ensureUser(principal);
    const addresses = await this.prisma.userAddress.findMany({
      where: { userId: principal.id, deletedAt: null },
      orderBy: [{ isDefaultSender: 'desc' }, { createdAt: 'desc' }],
    });
    return addresses.map(({ phoneHash: _hash, phoneEncrypted: _encrypted, ...address }) => ({
      ...address,
      phone: this.security.maskPhone(address.phoneLast4),
    }));
  }

  async createAddress(principal: AuthPrincipal, dto: CreateAddressDto) {
    this.ensureUser(principal);
    const phone = this.security.normalizePhone(dto.phone);
    const address = await this.prisma.userAddress.create({
      data: {
        userId: principal.id,
        label: dto.label,
        contactName: dto.contactName,
        phoneHash: this.security.hashPhone(phone),
        phoneEncrypted: this.security.encryptField(phone),
        phoneLast4: phone.slice(-4),
        countryCode: dto.countryCode ?? 'LA',
        country: dto.country,
        province: dto.province,
        city: dto.city,
        district: dto.district,
        detail: dto.detail,
        latitude: dto.latitude,
        longitude: dto.longitude,
        isDefaultSender: dto.isDefaultSender ?? false,
        isDefaultReceiver: dto.isDefaultReceiver ?? false,
      },
    });
    return { ...address, phoneHash: undefined, phoneEncrypted: undefined, phone: this.security.maskPhone(address.phoneLast4) };
  }

  async deleteAddress(principal: AuthPrincipal, addressId: string) {
    this.ensureUser(principal);
    const result = await this.prisma.userAddress.updateMany({
      where: { id: addressId, userId: principal.id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (result.count !== 1) throw new NotFoundException('地址不存在');
    return { deleted: true };
  }

  private ensureUser(principal: AuthPrincipal): void {
    if (principal.type !== PrincipalType.USER) throw new ForbiddenException('仅普通用户可访问');
  }
}
