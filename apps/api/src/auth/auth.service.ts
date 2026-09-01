import {
  BadRequestException,
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccountStatus, PrincipalType } from '@prisma/client';
import { randomInt, randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { SecurityService } from '../security/security.service.js';
import type { AuthPrincipal, JwtPayload } from '../common/types/auth-principal.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { SendCodeDto } from './dto/send-code.dto.js';
import type { VerifyCodeDto } from './dto/verify-code.dto.js';

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

interface RegistrationPayload {
  purpose: 'registration';
  challengeId: string;
  targetHash: string;
  channel: 'phone' | 'email';
}

const MOCK_VERIFY_CODE = '123456';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly security: SecurityService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    if ((!dto.phone && !dto.email) || (dto.phone && dto.email)) {
      throw new BadRequestException('手机号和邮箱必须且只能填写一项');
    }

    let phoneHash: string | undefined;
    let phoneEncrypted: string | undefined;
    let phoneLast4: string | undefined;
    let emailHash: string | undefined;
    let emailEncrypted: string | undefined;
    let emailLast4: string | undefined;
    let identifierMasked = '';

    if (dto.phone) {
      const normalized = this.security.normalizePhone(dto.phone);
      phoneHash = this.security.hashPhone(normalized);
      const existing = await this.prisma.user.findUnique({ where: { phoneHash } });
      if (existing) throw new ConflictException('该手机号已注册');
      phoneEncrypted = this.security.encryptField(normalized);
      phoneLast4 = normalized.slice(-4);
      identifierMasked = this.security.maskPhone(phoneLast4);
    }

    if (dto.email) {
      const normalized = this.security.normalizeEmail(dto.email);
      emailHash = this.security.hashEmail(normalized);
      const existing = await this.prisma.user.findUnique({ where: { emailHash } });
      if (existing) throw new ConflictException('该邮箱已注册');
      emailEncrypted = this.security.encryptField(normalized);
      emailLast4 = normalized.slice(-4);
      identifierMasked = identifierMasked || this.security.maskEmail(emailLast4);
    }

    const targetHash = phoneHash ?? emailHash!;
    let registration: RegistrationPayload;
    try {
      registration = await this.jwt.verifyAsync<RegistrationPayload>(dto.verificationToken);
    } catch {
      throw new UnauthorizedException('注册验证凭证无效或已过期');
    }
    if (
      registration.purpose !== 'registration' ||
      registration.targetHash !== targetHash ||
      registration.channel !== (dto.phone ? 'phone' : 'email')
    ) {
      throw new UnauthorizedException('注册验证凭证与注册账号不匹配');
    }

    const consumed = await this.prisma.verificationChallenge.updateMany({
      where: {
        id: registration.challengeId,
        targetHash,
        verifiedAt: { not: null },
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { consumedAt: new Date() },
    });
    if (consumed.count !== 1) {
      throw new UnauthorizedException('注册验证凭证已使用或已失效');
    }

    const customerRole = await this.prisma.role.findUnique({ where: { code: 'CUSTOMER' } });
    const user = await this.prisma.user.create({
      data: {
        displayName: dto.displayName,
        phoneHash,
        phoneEncrypted,
        phoneLast4,
        emailHash,
        emailEncrypted,
        emailLast4,
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
      identifierMasked,
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

  /** 用户验证码登录：校验短信/邮箱码后签发会话（不改动密码登录逻辑） */
  async loginByCode(dto: { phone?: string; email?: string; code: string }) {
    if ((!dto.phone && !dto.email) || (dto.phone && dto.email)) {
      throw new BadRequestException('手机号和邮箱必须且只能填写一项');
    }
    const target = dto.phone ? this.security.normalizePhone(dto.phone) : this.security.normalizeEmail(dto.email!);
    const targetHash = dto.phone ? this.security.hashPhone(target) : this.security.hashEmail(target);
    const challenge = await this.prisma.verificationChallenge.findFirst({
      where: { targetHash, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!challenge || challenge.expiresAt <= new Date()) {
      throw new UnauthorizedException('验证码不存在或已过期');
    }
    const maxAttempts = Number(this.config.get<string>('VERIFICATION_MAX_ATTEMPTS') ?? 5);
    if (challenge.attempts >= maxAttempts) {
      throw new UnauthorizedException('验证码尝试次数过多，请重新发送');
    }
    if (challenge.codeHash !== this.security.hashVerificationCode(challenge.id, dto.code)) {
      await this.prisma.verificationChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('验证码错误');
    }
    await this.prisma.verificationChallenge.update({
      where: { id: challenge.id },
      data: { verifiedAt: new Date(), consumedAt: new Date() },
    });
    const subject = await this.findSubject(PrincipalType.USER, target);
    if (!subject) {
      throw new UnauthorizedException('账号不存在，请先注册');
    }
    return this.issueSession(subject);
  }

  async changePassword(principal: AuthPrincipal, dto: { oldPassword: string; newPassword: string }) {
    if (principal.type !== PrincipalType.USER) {
      throw new BadRequestException('仅用户可修改密码');
    }
    if (dto.newPassword.length < 8) {
      throw new BadRequestException('新密码至少 8 位');
    }
    const user = await this.prisma.user.findFirst({
      where: { id: principal.id, deletedAt: null, status: AccountStatus.ACTIVE },
    });
    if (!user) throw new UnauthorizedException('用户不存在');
    if (!(await this.security.verifyPassword(dto.oldPassword, user.passwordHash))) {
      throw new UnauthorizedException('旧密码不正确');
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await this.security.hashPassword(dto.newPassword),
        tokenVersion: { increment: 1 },
      },
    });
    return { changed: true, message: '密码已更新，请重新登录' };
  }

  async sendCode(dto: SendCodeDto) {
    if ((!dto.phone && !dto.email) || (dto.phone && dto.email)) {
      throw new BadRequestException('手机号和邮箱必须且只能填写一项');
    }
    const target = dto.phone ? this.security.normalizePhone(dto.phone) : this.security.normalizeEmail(dto.email!);
    const purpose = dto.purpose ?? 'login';
    const existing = await this.findSubject(PrincipalType.USER, target);
    if ((purpose === 'login' || purpose === 'reset') && !existing) {
      throw new BadRequestException(purpose === 'reset' ? '账号不存在，无法重置密码' : '账号未注册，请先注册');
    }
    if (purpose === 'register' && existing) {
      throw new BadRequestException('账号已注册，请直接登录');
    }
    const targetHash = dto.phone ? this.security.hashPhone(target) : this.security.hashEmail(target);
    const isMock = this.config.get<string>('NODE_ENV', 'development') !== 'production';
    if (!isMock) {
      throw new ServiceUnavailableException('生产环境验证码发送服务尚未配置');
    }
    const code = isMock ? MOCK_VERIFY_CODE : String(randomInt(100_000, 1_000_000));
    const challengeId = randomUUID();
    const now = new Date();
    const ttlSeconds = Number(this.config.get<string>('VERIFICATION_CODE_TTL_SECONDS') ?? 300);
    await this.prisma.$transaction([
      this.prisma.verificationChallenge.updateMany({
        where: { targetHash, consumedAt: null },
        data: { consumedAt: now },
      }),
      this.prisma.verificationChallenge.create({
        data: {
          id: challengeId,
          targetHash,
          channel: dto.phone ? 'phone' : 'email',
          codeHash: this.security.hashVerificationCode(challengeId, code),
          expiresAt: new Date(now.getTime() + ttlSeconds * 1000),
        },
      }),
    ]);
    return {
      sent: true,
      target: dto.phone ? this.security.maskPhone(target.slice(-4)) : this.security.maskEmail(target.slice(-4)),
      ...(isMock ? { mockCode: code } : {}),
      message: isMock ? '模拟环境：验证码不会真实发送。' : '验证码已发送',
    };
  }

  /** 自助重置密码：验证码校验通过后更新密码并抬升 tokenVersion */
  async resetPassword(dto: { phone?: string; email?: string; code: string; newPassword: string }) {
    if ((!dto.phone && !dto.email) || (dto.phone && dto.email)) {
      throw new BadRequestException('手机号和邮箱必须且只能填写一项');
    }
    if (dto.newPassword.length < 8) {
      throw new BadRequestException('新密码至少 8 位');
    }
    const target = dto.phone ? this.security.normalizePhone(dto.phone) : this.security.normalizeEmail(dto.email!);
    const targetHash = dto.phone ? this.security.hashPhone(target) : this.security.hashEmail(target);
    const challenge = await this.prisma.verificationChallenge.findFirst({
      where: { targetHash, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!challenge || challenge.expiresAt <= new Date()) {
      throw new UnauthorizedException('验证码不存在或已过期');
    }
    const maxAttempts = Number(this.config.get<string>('VERIFICATION_MAX_ATTEMPTS') ?? 5);
    if (challenge.attempts >= maxAttempts) {
      throw new UnauthorizedException('验证码尝试次数过多，请重新发送');
    }
    if (challenge.codeHash !== this.security.hashVerificationCode(challenge.id, dto.code)) {
      await this.prisma.verificationChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('验证码错误');
    }
    const subject = await this.findSubject(PrincipalType.USER, target);
    if (!subject) throw new UnauthorizedException('账号不存在，请先注册');
    await this.prisma.$transaction([
      this.prisma.verificationChallenge.update({
        where: { id: challenge.id },
        data: { verifiedAt: new Date(), consumedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: subject.id },
        data: {
          passwordHash: await this.security.hashPassword(dto.newPassword),
          tokenVersion: { increment: 1 },
        },
      }),
    ]);
    return { reset: true, message: '密码已重置，请使用新密码登录' };
  }

  async verifyCode(dto: VerifyCodeDto) {
    if ((!dto.phone && !dto.email) || (dto.phone && dto.email)) {
      throw new BadRequestException('手机号和邮箱必须且只能填写一项');
    }
    const target = dto.phone ? this.security.normalizePhone(dto.phone) : this.security.normalizeEmail(dto.email!);
    const targetHash = dto.phone ? this.security.hashPhone(target) : this.security.hashEmail(target);
    const challenge = await this.prisma.verificationChallenge.findFirst({
      where: { targetHash, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!challenge || challenge.expiresAt <= new Date() || challenge.verifiedAt) {
      throw new UnauthorizedException('验证码不存在或已过期');
    }
    const maxAttempts = Number(this.config.get<string>('VERIFICATION_MAX_ATTEMPTS') ?? 5);
    if (challenge.attempts >= maxAttempts) {
      throw new UnauthorizedException('验证码尝试次数过多，请重新发送');
    }
    if (challenge.codeHash !== this.security.hashVerificationCode(challenge.id, dto.code)) {
      await this.prisma.verificationChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('验证码错误');
    }
    await this.prisma.verificationChallenge.update({
      where: { id: challenge.id },
      data: { verifiedAt: new Date() },
    });
    const verificationToken = await this.jwt.signAsync(
      {
        purpose: 'registration',
        challengeId: challenge.id,
        targetHash,
        channel: dto.phone ? 'phone' : 'email',
      } satisfies RegistrationPayload,
      { expiresIn: Number(this.config.get<string>('VERIFICATION_TOKEN_TTL_SECONDS') ?? 600) },
    );
    return { verified: true, verificationToken, message: '验证码校验通过' };
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
      const isEmail = identifier.includes('@');
      const where = isEmail
        ? { emailHash: this.security.hashEmail(identifier) }
        : { phoneHash: this.security.hashPhone(identifier) };
      const user = await this.prisma.user.findUnique({
        where,
        include: { roles: { include: { role: true } } },
      });
      if (!user || user.status !== AccountStatus.ACTIVE || user.deletedAt) return null;
      const masked = user.emailLast4
        ? this.security.maskEmail(user.emailLast4)
        : user.phoneLast4
          ? this.security.maskPhone(user.phoneLast4)
          : '';
      return {
        id: user.id,
        type,
        tokenVersion: user.tokenVersion,
        roles: user.roles.map((entry) => entry.role.code),
        permissions: [],
        passwordHash: user.passwordHash,
        displayName: user.displayName,
        identifierMasked: masked,
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
      const masked = user.emailLast4
        ? this.security.maskEmail(user.emailLast4)
        : user.phoneLast4
          ? this.security.maskPhone(user.phoneLast4)
          : '';
      return {
        id, type, tokenVersion: user.tokenVersion,
        roles: user.roles.map((entry) => entry.role.code), permissions: [],
        passwordHash: user.passwordHash, displayName: user.displayName,
        identifierMasked: masked,
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
