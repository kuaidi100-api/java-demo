#!/usr/bin/env node
/**
 * 测试数据清理脚本（木棉速达）
 *
 * 默认 dry-run：只打印将删除的数量，不写库。
 * 真正删除：加 --execute
 *
 * 安全门槛（缺一不可）：
 * 1) NODE_ENV !== 'production'
 * 2) DATABASE_URL 不命中生产黑名单（kapokstar.com / 明显 prod 主机等）
 * 3) NODE_ENV=test 或 TEST_DB=1 或 (ALLOW_TEST_DATA_CLEANUP=1 且 --i-know-this-is-not-prod)
 *
 * 环境变量：
 * - DATABASE_URL          Prisma 连接（可从 DK100/java-demo/.env 加载）
 * - API_BASE_URL          默认 http://127.0.0.1:3000/api/v1
 * - ADMIN_TOKEN           管理员 Bearer（优先）；或 ADMIN_USERNAME + ADMIN_PASSWORD 登录
 * - TEST_PHONE_LAST4      可选，按 phone_last4 匹配测试用户（逗号分隔）
 * - TEST_DISPLAY_NAME_LIKE 默认 %测试%
 *
 * 用法：
 *   node scripts/cleanup-test-data.mjs
 *   node scripts/cleanup-test-data.mjs --execute
 *   node scripts/cleanup-test-data.mjs --execute --skip-api
 *   node scripts/cleanup-test-data.mjs --execute --include-seed-users
 *   node scripts/cleanup-test-data.mjs --help
 */

import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHmac } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const apiDir = join(rootDir, 'apps', 'api');

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile(join(rootDir, '.env'));
loadEnvFile(join(rootDir, '.env.development'));

const args = new Set(process.argv.slice(2));
const HELP = args.has('--help') || args.has('-h');
const EXECUTE = args.has('--execute');
const SKIP_API = args.has('--skip-api');
const SKIP_DB = args.has('--skip-db');
const INCLUDE_SEED_USERS = args.has('--include-seed-users');
const I_KNOW = args.has('--i-know-this-is-not-prod');

if (HELP) {
  console.log(`cleanup-test-data.mjs

默认 dry-run。安全清理测试订单 / 测试用户关联数据 / mock 客服会话。

Flags:
  --execute                 真正删除
  --skip-api                跳过 DELETE /support/admin/sessions/mock
  --skip-db                 跳过 Prisma 删除
  --include-seed-users      同时清理 displayName 含「测试」且匹配测试号段的用户（慎用）
  --i-know-this-is-not-prod 当仅有 ALLOW_TEST_DATA_CLEANUP=1（非 NODE_ENV=test/TEST_DB）时必需
  --help

Env: NODE_ENV, TEST_DB, ALLOW_TEST_DATA_CLEANUP, DATABASE_URL, API_BASE_URL, ADMIN_TOKEN
`);
  process.exit(0);
}

/** 命中即硬拒绝，不可用 flag 绕过 */
const HARD_BLOCK_URL_PATTERNS = [
  /kapokstar\.com/i,
  /express_platform_prod\b/i,
  /[?&]env=prod\b/i,
];

/** 可疑生产迹象：需 TEST_DB=1 且 --i-know-this-is-not-prod */
const SOFT_BLOCK_URL_PATTERNS = [/\brds[.-]/i, /\bprod\b/i, /\bproduction\b/i, /aliyuncs\.com/i, /amazonaws\.com/i];

const LOCAL_SAFE_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', 'mysql', 'host.docker.internal']);

function maskUrl(url) {
  try {
    const u = new URL(url.replace(/^mysql:\/\//, 'http://'));
    if (u.password) u.password = '***';
    return u.toString().replace(/^http:\/\//, 'mysql://');
  } catch {
    return '(unparseable DATABASE_URL)';
  }
}

function parseMysqlUrl(url) {
  const normalized = url.replace(/^mysql:\/\//, 'http://');
  const u = new URL(normalized);
  return {
    host: u.hostname,
    port: u.port || '3306',
    database: u.pathname.replace(/^\//, '').split('?')[0],
    user: decodeURIComponent(u.username || ''),
  };
}

function assertSafetyGate() {
  const nodeEnv = (process.env.NODE_ENV || '').toLowerCase();
  if (nodeEnv === 'production') {
    throw new Error('拒绝执行：NODE_ENV=production');
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl && !SKIP_DB) {
    throw new Error('缺少 DATABASE_URL（可在 DK100/java-demo/.env 配置）');
  }

  if (dbUrl) {
    for (const re of HARD_BLOCK_URL_PATTERNS) {
      if (re.test(dbUrl)) {
        throw new Error(`拒绝执行：DATABASE_URL 命中生产硬黑名单 (${re}) → ${maskUrl(dbUrl)}`);
      }
    }
    const softHit = SOFT_BLOCK_URL_PATTERNS.find((re) => re.test(dbUrl));
    if (softHit && (process.env.TEST_DB !== '1' || !I_KNOW)) {
      throw new Error(
        `拒绝执行：DATABASE_URL 疑似云/生产库 (${softHit}) → ${maskUrl(dbUrl)}。` +
          `若确为独立测试库：设 TEST_DB=1 并加 --i-know-this-is-not-prod`,
      );
    }
    const parsed = parseMysqlUrl(dbUrl);
    if (!LOCAL_SAFE_HOSTS.has(parsed.host) && !/_test$/i.test(parsed.database)) {
      if (process.env.TEST_DB !== '1' || !I_KNOW) {
        throw new Error(
          `拒绝执行：非本机库且非 *_test 库名（host=${parsed.host}, db=${parsed.database}）。` +
            `请设 TEST_DB=1 并加 --i-know-this-is-not-prod`,
        );
      }
    }
  }

  const allowedByEnv =
    nodeEnv === 'test' || process.env.TEST_DB === '1' || (process.env.ALLOW_TEST_DATA_CLEANUP === '1' && I_KNOW);

  if (!allowedByEnv) {
    throw new Error(
      '拒绝执行：需 NODE_ENV=test 或 TEST_DB=1，或 ALLOW_TEST_DATA_CLEANUP=1 且 --i-know-this-is-not-prod',
    );
  }

  return dbUrl ? parseMysqlUrl(dbUrl) : null;
}

function pickAccessToken(json) {
  return json?.data?.accessToken || json?.accessToken || json?.data?.token || null;
}

async function getAdminToken(apiBase) {
  if (process.env.ADMIN_TOKEN) return process.env.ADMIN_TOKEN;
  const identifier = process.env.ADMIN_USERNAME || process.env.SEED_ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD;
  if (!identifier || !password) {
    console.warn('[api] 无 ADMIN_TOKEN / SEED_ADMIN_USERNAME+PASSWORD，跳过 mock 会话清理');
    return null;
  }
  try {
    const res = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectType: 'ADMINISTRATOR',
        identifier,
        password,
      }),
    });
    const json = await res.json().catch(() => ({}));
    const token = pickAccessToken(json);
    if (!res.ok || !token) {
      console.warn('[api] 管理员登录失败，跳过会话清理', { status: res.status, body: json });
      return null;
    }
    return token;
  } catch (err) {
    console.warn('[api] 登录请求失败:', err instanceof Error ? err.message : err);
    return null;
  }
}

async function clearMockSessions(apiBase) {
  const token = await getAdminToken(apiBase);
  if (!token) return { skipped: true, reason: 'no admin token' };
  const res = await fetch(`${apiBase}/support/admin/sessions/mock`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, status: res.status, body: json };
  }
  return { ok: true, cleared: json?.data?.cleared ?? json?.cleared ?? json };
}

function phoneHash(phone, key) {
  return createHmac('sha256', key).update(String(phone).replace(/[\s()-]/g, '')).digest('hex');
}

async function createPrisma() {
  const require = createRequire(join(apiDir, 'package.json'));
  let PrismaClient;
  try {
    ({ PrismaClient } = require('@prisma/client'));
  } catch {
    throw new Error('无法加载 @prisma/client。请先在仓库根执行: npm run db:generate');
  }
  return new PrismaClient();
}

async function planAndCleanDb(prisma, { execute }) {
  const last4List = (process.env.TEST_PHONE_LAST4 || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const mockOrders = await prisma.expressOrder.findMany({
    where: { isMock: true },
    select: { id: true, orderNo: true, serviceType: true, status: true },
  });

  const ticketWhere = {
    OR: [{ subject: { contains: '测试' } }, { description: { contains: '测试' } }],
  };
  const testTickets = await prisma.customerServiceTicket.findMany({
    where: ticketWhere,
    select: { id: true, ticketNo: true },
  });

  let testUsers = [];
  if (INCLUDE_SEED_USERS) {
    const or = [{ displayName: { contains: '测试' } }];
    if (last4List.length) or.push({ phoneLast4: { in: last4List } });
    // 也支持通过 SEED 手机号哈希精确匹配
    const seedPhone = process.env.SEED_USER_PHONE;
    const hashKey = process.env.PHONE_HASH_KEY;
    if (seedPhone && hashKey) {
      or.push({ phoneHash: phoneHash(seedPhone, hashKey) });
    }
    testUsers = await prisma.user.findMany({
      where: { OR: or },
      select: { id: true, displayName: true, phoneLast4: true },
    });
  }

  const plan = {
    mockOrders: mockOrders.length,
    sampleOrders: mockOrders.slice(0, 8).map((o) => `${o.orderNo}(${o.serviceType}/${o.status})`),
    testTickets: testTickets.length,
    testUsers: testUsers.length,
    sampleUsers: testUsers.slice(0, 5).map((u) => `${u.displayName}/${u.phoneLast4 || '-'}`),
    verificationChallenges: await prisma.verificationChallenge.count(),
  };

  if (!execute) {
    return { dryRun: true, plan };
  }

  // 先清关联工单/通知中指向 mock 订单的，再删订单（多数子表 onDelete Cascade）
  const orderIds = mockOrders.map((o) => o.id);
  let deletedTickets = 0;
  let deletedOrders = 0;
  let deletedUsers = 0;
  let deletedChallenges = 0;

  if (testTickets.length) {
    const r = await prisma.customerServiceTicket.deleteMany({
      where: { id: { in: testTickets.map((t) => t.id) } },
    });
    deletedTickets += r.count;
  }

  if (orderIds.length) {
    // 通知、财务等若无 cascade，尽量先删
    await prisma.notification.deleteMany({ where: { orderId: { in: orderIds } } }).catch(() => {});
    await prisma.financeLedger.deleteMany({ where: { orderId: { in: orderIds } } }).catch(() => {});
    await prisma.customerServiceTicket.deleteMany({ where: { orderId: { in: orderIds } } }).catch(() => {});
    const r = await prisma.expressOrder.deleteMany({ where: { id: { in: orderIds } } });
    deletedOrders = r.count;
  }

  if (INCLUDE_SEED_USERS && testUsers.length) {
    const userIds = testUsers.map((u) => u.id);
    await prisma.notification.deleteMany({ where: { userId: { in: userIds } } }).catch(() => {});
    await prisma.customerServiceTicket.deleteMany({ where: { userId: { in: userIds } } }).catch(() => {});
    await prisma.userAddress.deleteMany({ where: { userId: { in: userIds } } }).catch(() => {});
    await prisma.userRole.deleteMany({ where: { userId: { in: userIds } } }).catch(() => {});
    // 若仍有非 mock 订单则跳过该用户
    for (const uid of userIds) {
      const remain = await prisma.expressOrder.count({ where: { userId: uid } });
      if (remain > 0) {
        console.warn(`[db] 跳过用户 ${uid}：仍有 ${remain} 条非本次删除订单`);
        continue;
      }
      await prisma.user.delete({ where: { id: uid } });
      deletedUsers += 1;
    }
  }

  // 仅清未消费的过期验证码（低风险）
  const now = new Date();
  const ch = await prisma.verificationChallenge.deleteMany({
    where: { OR: [{ expiresAt: { lt: now } }, { consumedAt: { not: null } }] },
  });
  deletedChallenges = ch.count;

  return {
    dryRun: false,
    plan,
    deleted: { orders: deletedOrders, tickets: deletedTickets, users: deletedUsers, challenges: deletedChallenges },
  };
}

async function main() {
  console.log('=== cleanup-test-data ===');
  console.log(`mode: ${EXECUTE ? 'EXECUTE' : 'DRY-RUN'}`);
  const parsed = assertSafetyGate();
  if (parsed) {
    console.log(`db: ${parsed.user}@${parsed.host}:${parsed.port}/${parsed.database}`);
  }
  console.log(`NODE_ENV=${process.env.NODE_ENV || '(unset)'} TEST_DB=${process.env.TEST_DB || ''} ALLOW=${process.env.ALLOW_TEST_DATA_CLEANUP || ''}`);

  const apiBase = (process.env.API_BASE_URL || 'http://127.0.0.1:3000/api/v1').replace(/\/$/, '');
  const summary = { api: null, db: null };

  if (!SKIP_API) {
    if (!EXECUTE) {
      console.log(`[api] dry-run: would DELETE ${apiBase}/support/admin/sessions/mock`);
      summary.api = { dryRun: true };
    } else {
      summary.api = await clearMockSessions(apiBase);
      console.log('[api]', JSON.stringify(summary.api));
    }
  } else {
    summary.api = { skipped: true };
  }

  if (!SKIP_DB) {
    const prisma = await createPrisma();
    try {
      summary.db = await planAndCleanDb(prisma, { execute: EXECUTE });
      console.log('[db]', JSON.stringify(summary.db, null, 2));
    } finally {
      await prisma.$disconnect();
    }
  } else {
    summary.db = { skipped: true };
  }

  if (!EXECUTE) {
    console.log('\n未删除任何数据。确认后请加 --execute');
  } else {
    console.log('\n清理完成。');
  }
}

main().catch((err) => {
  console.error('\n[FATAL]', err.message || err);
  process.exit(1);
});
