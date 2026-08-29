import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccountStatus, PrincipalType } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { SecurityService } from '../security/security.service.js';
import type { AuthPrincipal, JwtPayload } from '../common/types/auth-principal.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';

interface RefreshPayload {
  sid: string;
  sub: string;
  type: PrincipalType;
  version: number;
}

interface SubjectWithPassword extends AuthPrincipal {
  passwordHash: string;
  displayName: string;
  identifierMasked: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly security: SecurityService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const normalized = this.security.normalizePhone(dto.phone);
    const hashedPhone = this.security.hashPhone(normalized);
    const existing = await this.prisma.user.findUnique({ where: { phoneHash: hashedPhone } });
    if (existing) throw new ConflictException('该手机号已注册');

    const customerRole = await this.prisma.role.findUnique({ where: { code: 'CUSTOMER' } });
    const user = await this.prisma.user.create({
      data: {
        displayName: dto.displayName,
        phoneHash: hashedPhone,
        phoneEncrypted: this.security.encryptField(normalized),
        phoneLast4: normalized.slice(-4),
        passwordHash: await this.security.hashPassword(dto.password),
        ...(customerRole
          ? { roles: { create: { roleId: customerRole.id } } }
          : {}),
      },
      include: { roles: { include: { role: true } } },
    });

    const principal: SubjectWithPassword = {
      id: user.id,
      type: PrincipalType.USER,
      tokenVersion: user.tokenVersion,
      roles: user.roles.map((entry) => entry.role.code),
      permissions: [],
      passwordHash: user.passwordHash,
      displayName: user.displayName,
      identifierMasked: this.security.maskPhone(user.phoneLast4),
    };
    return this.issueSession(principal);
  }

  async login(dto: LoginDto) {
    if (dto.subjectType === PrincipalType.SYSTEM) {
      throw new UnauthorizedException('不允许系统主体登录');
    }
    const subject = await this.findSubject(dto.subjectType, dto.identifier);
    if (!subject || !(await this.security.verifyPassword(dto.password, subject.passwordHash))) {
      throw new UnauthorizedException('账号或密码错误');
    }
    return this.issueSession(subject);
  }

  async refresh(refreshToken: string) {
    let payload: RefreshPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh Token 无效或已过期');
    }

    const session = await this.prisma.refreshSession.findUnique({ where: { id: payload.sid } });
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      session.tokenHash !== this.security.hashOpaqueToken(refreshToken)
    ) {
      throw new UnauthorizedException('Refresh Token 已撤销或不存在');
    }

    const principal = await this.resolvePrincipal({
      sub: payload.sub,
      type: payload.type,
      version: payload.version,
      roles: [],
      permissions: [],
    });
    const revoked = await this.prisma.refreshSession.updateMany({
      where: { id: session.id, revokedAt: null },
      data: { revokedAt: new Date(), lastUsedAt: new Date() },
    });
    if (revoked.count !== 1) throw new UnauthorizedException('Refresh Token 已被使用');
    return this.issueSession({
      ...principal,
      passwordHash: '',
      displayName: '',
      identifierMasked: '',
    });
  }

  async logout(refreshToken: string): Promise<{ loggedOut: boolean }> {
    try {
      const payload = await this.jwt.verifyAsync<RefreshPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      await this.prisma.refreshSession.updateMany({
        where: { id: payload.sid, tokenHash: this.security.hashOpaqueToken(refreshToken) },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Logout is intentionally idempotent and does not reveal token validity.
    }
    return { loggedOut: true };
  }

  async resolvePrincipal(payload: JwtPayload): Promise<AuthPrincipal> {
    const subject = await this.findSubjectById(payload.type, payload.sub);
    if (!subject || subject.tokenVersion !== payload.version) {
      throw new UnauthorizedException('Access Token 已失效');
    }
    return {
      id: subject.id,
      type: subject.type,
      tokenVersion: subject.tokenVersion,
      roles: subject.roles,
      permissions: subject.permissions,
    };
  }

  private async issueSession(subject: SubjectWithPassword) {
    const accessTtlSeconds = Number(this.config.get<string>('JWT_ACCESS_TTL_SECONDS') ?? 900);
    const refreshDays = Number(this.config.get<string>('JWT_REFRESH_TTL_DAYS') ?? 30);
    const jwtPayload: JwtPayload = {
      sub: subject.id,
      type: subject.type,
      version: subject.tokenVersion,
      roles: subject.roles,
      permissions: subject.permissions,
    };
    const accessToken = await this.jwt.signAsync(jwtPayload, {
      expiresIn: accessTtlSeconds,
    });

    const sessionId = randomUUID();
    const refreshPayload: RefreshPayload = {
      sid: sessionId,
      sub: subject.id,
      type: subject.type,
      version: subject.tokenVersion,
    };
    const refreshToken = await this.jwt.signAsync(refreshPayload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshDays * 86_400,
    });
    await this.prisma.refreshSession.create({
      data: {
        id: sessionId,
        subjectType: subject.type,
        subjectId: subject.id,
        tokenHash: this.security.hashOpaqueToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshDays * 86_400_000),
      },
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: accessTtlSeconds,
      subject: {
        id: subject.id,
        type: subject.type,
        displayName: subject.displayName || undefined,
        identifier: subject.identifierMasked || undefined,
        roles: subject.roles,
        permissions: subject.permissions,
      },
      environment: { enabled: true, label: '模拟环境' },
    };
  }

  private async findSubject(type: PrincipalType, identifier: string): Promise<SubjectWithPassword | null> {
    if (type === PrincipalType.USER) {
      const user = await this.prisma.user.findUnique({
        where: { phoneHash: this.security.hashPhone(identifier) },
        include: { roles: { include: { role: true } } },
      });
      if (!user || user.status !== AccountStatus.ACTIVE || user.deletedAt) return null;
      return {
        id: user.id,
        type,
        tokenVersion: user.tokenVersion,
        roles: user.roles.map((entry) => entry.role.code),
        permissions: [],
        passwordHash: user.passwordHash,
        displayName: user.displayName,
        identifierMasked: this.security.maskPhone(user.phoneLast4),
      };
    }
    if (type === PrincipalType.COURIER) {
      const courier = await this.prisma.courier.findUnique({
        where: { phoneHash: this.security.hashPhone(identifier) },
      });
      if (!courier || courier.accountStatus !== AccountStatus.ACTIVE || courier.deletedAt) return null;
      return {
        id: courier.id,
        type,
        tokenVersion: courier.tokenVersion,
        roles: ['COURIER'],
        permissions: [],
        passwordHash: courier.passwordHash,
        displayName: courier.displayName,
        identifierMasked: this.security.maskPhone(courier.phoneLast4),
      };
    }
    if (type === PrincipalType.ADMINISTRATOR) {
      const administrator = await this.prisma.administrator.findUnique({
        where: { username: identifier },
        include: {
          roles: {
            include: {
              role: {
                include: { permissions: { include: { permission: true } } },
              },
            },
          },
        },
      });
      if (!administrator || administrator.status !== AccountStatus.ACTIVE || administrator.deletedAt) return null;
      return {
        id: administrator.id,
        type,
        tokenVersion: administrator.tokenVersion,
        roles: administrator.roles.map((entry) => entry.role.code),
        permissions: administrator.roles.flatMap((entry) =>
          entry.role.permissions.map((permission) => permission.permission.code)),
        passwordHash: administrator.passwordHash,
        displayName: administrator.displayName,
        identifierMasked: administrator.username,
      };
    }
    return null;
  }

  private async findSubjectById(type: PrincipalType, id: string): Promise<SubjectWithPassword | null> {
    if (type === PrincipalType.USER) {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: { roles: { include: { role: true } } },
      });
      if (!user || user.status !== AccountStatus.ACTIVE || user.deletedAt) return null;
      return {
        id, type, tokenVersion: user.tokenVersion,
        roles: user.roles.map((entry) => entry.role.code), permissions: [],
        passwordHash: user.passwordHash, displayName: user.displayName,
        identifierMasked: this.security.maskPhone(user.phoneLast4),
      };
    }
    if (type === PrincipalType.COURIER) {
      const courier = await this.prisma.courier.findUnique({ where: { id } });
      if (!courier || courier.accountStatus !== AccountStatus.ACTIVE || courier.deletedAt) return null;
      return {
        id, type, tokenVersion: courier.tokenVersion, roles: ['COURIER'], permissions: [],
        passwordHash: courier.passwordHash, displayName: courier.displayName,
        identifierMasked: this.security.maskPhone(courier.phoneLast4),
      };
    }
    if (type === PrincipalType.ADMINISTRATOR) {
      const administrator = await this.prisma.administrator.findUnique({
        where: { id },
        include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
      });
      if (!administrator || administrator.status !== AccountStatus.ACTIVE || administrator.deletedAt) return null;
      return {
        id, type, tokenVersion: administrator.tokenVersion,
        roles: administrator.roles.map((entry) => entry.role.code),
        permissions: administrator.roles.flatMap((entry) => entry.role.permissions.map((item) => item.permission.code)),
        passwordHash: administrator.passwordHash, displayName: administrator.displayName,
        identifierMasked: administrator.username,
      };
    }
    return null;
  }
}
