import 'dotenv/config';
import { createCipheriv, createHmac, randomBytes } from 'node:crypto';
import { hash } from 'bcryptjs';
import {
  ItemType,
  OrderAddressType,
  OrderServiceType,
  OrderStatus,
  Permission,
  PrismaClient,
  PrincipalType,
} from '@prisma/client';

const prisma = new PrismaClient();

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing seed environment variable: ${name}`);
  return value;
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s()-]/g, '');
}

function phoneHash(phone: string): string {
  return createHmac('sha256', required('PHONE_HASH_KEY'))
    .update(normalizePhone(phone))
    .digest('hex');
}

function encrypt(value: string): string {
  const key = Buffer.from(required('FIELD_ENCRYPTION_KEY'), 'hex');
  if (key.length !== 32) throw new Error('FIELD_ENCRYPTION_KEY must be 32 bytes of hex');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${encrypted.toString('base64url')}`;
}

async function upsertPermission(code: string, name: string): Promise<Permission> {
  return prisma.permission.upsert({
    where: { code },
    update: { name },
    create: { code, name },
  });
}

async function main(): Promise<void> {
  const permissions = await Promise.all([
    upsertPermission('dashboard.read', '查看数据概览'),
    upsertPermission('users.manage', '管理用户'),
    upsertPermission('couriers.manage', '管理配送员'),
    upsertPermission('orders.read', '查看订单'),
    upsertPermission('orders.dispatch', '调度订单'),
    upsertPermission('pricing.manage', '管理价格规则'),
    upsertPermission('rbac.manage', '管理角色权限'),
    upsertPermission('warehouse.operate', '库管入库发车'),
    upsertPermission('finance.read', '查看财务对账'),
    upsertPermission('tickets.manage', '客服工单处理'),
  ]);

  const adminRole = await prisma.role.upsert({
    where: { code: 'SUPER_ADMIN' },
    update: { name: '超级管理员' },
    create: { code: 'SUPER_ADMIN', name: '超级管理员', isSystem: true },
  });
  const customerRole = await prisma.role.upsert({
    where: { code: 'CUSTOMER' },
    update: { name: '平台用户' },
    create: { code: 'CUSTOMER', name: '平台用户', isSystem: true },
  });

  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: permission.id },
    });
  }

  const admin = await prisma.administrator.upsert({
    where: { username: required('SEED_ADMIN_USERNAME') },
    update: { displayName: '测试管理员（虚拟）' },
    create: {
      username: required('SEED_ADMIN_USERNAME'),
      displayName: '测试管理员（虚拟）',
      passwordHash: await hash(required('SEED_ADMIN_PASSWORD'), 12),
    },
  });
  await prisma.administratorRole.upsert({
    where: { administratorId_roleId: { administratorId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { administratorId: admin.id, roleId: adminRole.id },
  });

  const userPhone = normalizePhone(required('SEED_USER_PHONE'));
  const user = await prisma.user.upsert({
    where: { phoneHash: phoneHash(userPhone) },
    update: { displayName: '测试用户一（虚拟）' },
    create: {
      displayName: '测试用户一（虚拟）',
      phoneHash: phoneHash(userPhone),
      phoneEncrypted: encrypt(userPhone),
      phoneLast4: userPhone.slice(-4),
      passwordHash: await hash(required('SEED_USER_PASSWORD'), 12),
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: customerRole.id } },
    update: {},
    create: { userId: user.id, roleId: customerRole.id },
  });

  const courierPhone = normalizePhone(required('SEED_COURIER_PHONE'));
  await prisma.courier.upsert({
    where: { phoneHash: phoneHash(courierPhone) },
    update: { displayName: '测试配送员一（虚拟）', riderCode: 'A-测试' },
    create: {
      displayName: '测试配送员一（虚拟）',
      phoneHash: phoneHash(courierPhone),
      phoneEncrypted: encrypt(courierPhone),
      phoneLast4: courierPhone.slice(-4),
      passwordHash: await hash(required('SEED_COURIER_PASSWORD'), 12),
      workStatus: 'AVAILABLE',
      riderCode: 'A-测试',
      depositBalance: '500',
    },
  });

  await prisma.freightRule.upsert({
    where: { channel: 'NEXT_DAY' },
    update: { basePrice: '20', stepPrice: '15' },
    create: {
      channel: 'NEXT_DAY',
      baseWeight: '1',
      basePrice: '20',
      stepWeight: '1',
      stepPrice: '15',
      currency: 'CNY',
    },
  });
  await prisma.freightRule.upsert({
    where: { channel: 'ECONOMY' },
    update: { basePrice: '15', stepPrice: '10' },
    create: {
      channel: 'ECONOMY',
      baseWeight: '1',
      basePrice: '15',
      stepWeight: '1',
      stepPrice: '10',
      currency: 'CNY',
    },
  });

  const addressCount = await prisma.userAddress.count({ where: { userId: user.id } });
  if (addressCount === 0) {
    await prisma.userAddress.create({
      data: {
        userId: user.id,
        label: '测试地址',
        contactName: '测试用户一（虚拟）',
        phoneHash: phoneHash(userPhone),
        phoneEncrypted: encrypt(userPhone),
        phoneLast4: userPhone.slice(-4),
        country: '老挝',
        city: '万象市',
        district: '西沙达那区',
        detail: '测试路 100 号（虚拟地址）',
        latitude: '17.9757000',
        longitude: '102.6331000',
        isDefaultSender: true,
      },
    });
  }

  const area = await prisma.serviceArea.upsert({
    where: { code: 'LA-VTE-DEMO' },
    update: { name: '万象测试服务区（虚拟）' },
    create: {
      code: 'LA-VTE-DEMO',
      name: '万象测试服务区（虚拟）',
      countryCode: 'LA',
      region: 'Vientiane',
      boundary: {
        type: 'Polygon',
        coordinates: [[[102.55, 17.9], [102.72, 17.9], [102.72, 18.05], [102.55, 18.05], [102.55, 17.9]]],
      },
    },
  });
  const pricingCount = await prisma.pricingRule.count({ where: { serviceAreaId: area.id } });
  if (pricingCount === 0) {
    await prisma.pricingRule.create({
      data: {
        serviceAreaId: area.id,
        name: '同城跑腿基础价（虚拟）',
        serviceType: OrderServiceType.SAME_CITY,
        baseFee: '20000',
        perKmFee: '3000',
        perKgFee: '1000',
        minimumFee: '20000',
        currency: 'LAK',
        effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
      },
    });
  }

  await prisma.expressOrder.upsert({
    where: { orderNo: 'DEMO-20260829-0001' },
    update: {},
    create: {
      orderNo: 'DEMO-20260829-0001',
      userId: user.id,
      serviceType: OrderServiceType.SAME_CITY,
      status: OrderStatus.PENDING_ACCEPTANCE,
      estimatedFee: '25000',
      currency: 'LAK',
      remark: '仅用于本地演示，不会创建真实寄件订单',
      isMock: true,
      addresses: {
        create: [
          {
            type: OrderAddressType.SENDER,
            contactName: '测试寄件人（虚拟）',
            phoneHash: phoneHash(userPhone),
            phoneEncrypted: encrypt(userPhone),
            phoneLast4: userPhone.slice(-4),
            country: '老挝',
            city: '万象市',
            district: '西沙达那区',
            detail: '测试路 100 号（虚拟地址）',
            latitude: '17.9757000',
            longitude: '102.6331000',
          },
          {
            type: OrderAddressType.RECIPIENT,
            contactName: '测试收件人（虚拟）',
            phoneHash: phoneHash('+8562099990003'),
            phoneEncrypted: encrypt('+8562099990003'),
            phoneLast4: '0003',
            country: '老挝',
            city: '万象市',
            district: '占塔布里区',
            detail: '演示大道 200 号（虚拟地址）',
            latitude: '17.9685000',
            longitude: '102.6137000',
          },
        ],
      },
      items: {
        create: {
          type: ItemType.DOCUMENT,
          name: '测试文件（虚拟）',
          quantity: 1,
          weightKg: '0.500',
        },
      },
      statusLogs: {
        create: [
          { toStatus: OrderStatus.DRAFT, operatorType: PrincipalType.SYSTEM, reason: '种子数据创建' },
          { fromStatus: OrderStatus.DRAFT, toStatus: OrderStatus.PENDING_CONFIRMATION, operatorType: PrincipalType.USER, operatorId: user.id, reason: '模拟用户提交' },
          { fromStatus: OrderStatus.PENDING_CONFIRMATION, toStatus: OrderStatus.PENDING_DISPATCH, operatorType: PrincipalType.USER, operatorId: user.id, reason: '模拟用户确认' },
          { fromStatus: OrderStatus.PENDING_DISPATCH, toStatus: OrderStatus.PENDING_ACCEPTANCE, operatorType: PrincipalType.SYSTEM, reason: 'MockProvider 模拟调度' },
        ],
      },
      shipment: {
        create: {
          shipmentNo: 'MOCK-LA-000001',
          providerCode: 'MOCK',
          status: 'CREATED',
          isMock: true,
          trackingEvents: {
            create: {
              status: 'PENDING_ACCEPTANCE',
              description: '模拟运单已创建，等待配送员接单',
              location: '万象测试服务区（虚拟）',
              occurredAt: new Date('2026-08-29T04:00:00.000Z'),
            },
          },
        },
      },
      task: { create: { status: 'PENDING' } },
    },
  });

  console.log('Seed completed with virtual data only.');
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Unknown seed error');
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
