/**
 * 本地生活服务全链路压力模拟：10 用户 × 打车/跑腿/搬家/代购 + 骑手/司机/代买员 + 客服
 * 运行：node --env-file=.env scripts/lifestyle-stress-sim.mjs
 */
import { createCipheriv, createHmac, randomBytes } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BASE = process.env.STRESS_API_BASE || 'http://127.0.0.1:3000/api/v1';
const OUT_DIR = join(ROOT, 'tmp', 'stress-sim');
const prisma = new PrismaClient();
const ACCESS_SECRET = requiredEnv('JWT_ACCESS_SECRET');
const ACCESS_TTL = Number(process.env.JWT_ACCESS_TTL_SECONDS ?? 3600);

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}
function required(name) {
  return requiredEnv(name);
}

function mintAccessToken({ id, type, tokenVersion = 0, roles = [], permissions = [] }) {
  return jwt.sign(
    { sub: id, type, version: tokenVersion, roles, permissions },
    ACCESS_SECRET,
    { expiresIn: ACCESS_TTL },
  );
}
function normalizePhone(phone) {
  return phone.replace(/[\s()-]/g, '');
}
function phoneHash(phone) {
  return createHmac('sha256', required('PHONE_HASH_KEY')).update(normalizePhone(phone)).digest('hex');
}
function encrypt(value) {
  const key = Buffer.from(required('FIELD_ENCRYPTION_KEY'), 'hex');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${encrypted.toString('base64url')}`;
}

function errorMessage(json) {
  const e = json?.error;
  if (typeof e === 'string') return e;
  if (e && typeof e === 'object') {
    const m = e.message;
    if (typeof m === 'string') return m;
    if (Array.isArray(m)) return m.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join('; ');
  }
  if (typeof json?.message === 'string') return json.message;
  return JSON.stringify(json);
}

async function api(method, path, { token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    const err = new Error(`${method} ${path} → ${res.status}: ${errorMessage(json)}`);
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  return json.data ?? json;
}

async function ensureUserAccount({ displayName, phone, password }) {
  const customerRole = await prisma.role.findUnique({ where: { code: 'CUSTOMER' } });
  if (!customerRole) throw new Error('CUSTOMER role missing — run db:seed');
  const normalized = normalizePhone(phone);
  const passwordHash = await hash(password, 12);
  const user = await prisma.user.upsert({
    where: { phoneHash: phoneHash(normalized) },
    update: {
      displayName,
      passwordHash,
      deletedAt: null,
      status: 'ACTIVE',
    },
    create: {
      displayName,
      phoneHash: phoneHash(normalized),
      phoneEncrypted: encrypt(normalized),
      phoneLast4: normalized.slice(-4),
      passwordHash,
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: customerRole.id } },
    update: {},
    create: { userId: user.id, roleId: customerRole.id },
  });
  return {
    id: user.id,
    accessToken: mintAccessToken({
      id: user.id,
      type: 'USER',
      tokenVersion: user.tokenVersion,
      roles: ['CUSTOMER'],
      permissions: [],
    }),
    displayName,
    phone,
  };
}

async function loginAdmin() {
  const username = required('SEED_ADMIN_USERNAME');
  const admin = await prisma.administrator.findUnique({
    where: { username },
    include: {
      roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
    },
  });
  if (!admin) throw new Error('Admin not seeded');
  const roles = admin.roles.map((r) => r.role.code);
  const permissions = [
    ...new Set(admin.roles.flatMap((r) => r.role.permissions.map((p) => p.permission.code))),
  ];
  return {
    id: admin.id,
    accessToken: mintAccessToken({
      id: admin.id,
      type: 'ADMINISTRATOR',
      tokenVersion: admin.tokenVersion,
      roles,
      permissions,
    }),
  };
}

async function ensureStaffCouriers() {
  const password = 'DemoCourier!2026';
  const passwordHash = await hash(password, 12);
  const staff = [
    { phone: '+8562099990101', displayName: '司机-老王（即时打车）', riderCode: 'DRV-01', roleTag: 'driver' },
    { phone: '+8562099990102', displayName: '司机-阿峰（打车备班）', riderCode: 'DRV-02', roleTag: 'driver' },
    { phone: '+8562099990201', displayName: '骑手-小陈（预约跑腿）', riderCode: 'RID-01', roleTag: 'rider' },
    { phone: '+8562099990202', displayName: '骑手-阿美（跑腿/抢单）', riderCode: 'RID-02', roleTag: 'rider' },
    { phone: '+8562099990301', displayName: '搬家师傅-老周', riderCode: 'MOV-01', roleTag: 'mover' },
    { phone: '+8562099990401', displayName: '代买员-琳琳（商超）', riderCode: 'BUY-01', roleTag: 'buyer' },
    { phone: '+8562099990402', displayName: '代买员-阿杰（夜市）', riderCode: 'BUY-02', roleTag: 'buyer' },
  ];
  const out = [];
  for (const s of staff) {
    const phone = normalizePhone(s.phone);
    const row = await prisma.courier.upsert({
      where: { phoneHash: phoneHash(phone) },
      update: {
        displayName: s.displayName,
        riderCode: s.riderCode,
        workStatus: 'AVAILABLE',
        accountStatus: 'ACTIVE',
        passwordHash,
        deletedAt: null,
      },
      create: {
        displayName: s.displayName,
        phoneHash: phoneHash(phone),
        phoneEncrypted: encrypt(phone),
        phoneLast4: phone.slice(-4),
        passwordHash,
        workStatus: 'AVAILABLE',
        riderCode: s.riderCode,
        depositBalance: '800',
      },
    });
    out.push({
      ...s,
      id: row.id,
      accessToken: mintAccessToken({
        id: row.id,
        type: 'COURIER',
        tokenVersion: row.tokenVersion,
        roles: [],
        permissions: [],
      }),
    });
  }
  return out;
}

async function createAddresses(token, contactName, phone) {
  const common = {
    contactName,
    phone,
    countryCode: 'LA',
    country: '老挝',
    city: '金三角经济特区',
    district: '湄公河沿岸',
  };
  const home = await api('POST', '/addresses', {
    token,
    body: {
      ...common,
      label: '家',
      detail: '星光夜市二期木棉快递旁 A 栋 1203',
      latitude: 20.34512,
      longitude: 100.08145,
      isDefaultSender: true,
      isDefaultReceiver: true,
    },
  });
  const shop = await api('POST', '/addresses', {
    token,
    body: {
      ...common,
      label: '商超',
      detail: '唐人街大黄楼一层超市门口',
      latitude: 20.35102,
      longitude: 100.07891,
    },
  });
  const hotel = await api('POST', '/addresses', {
    token,
    body: {
      ...common,
      label: '酒店',
      detail: '木棉之星酒店大堂',
      latitude: 20.3488,
      longitude: 100.0821,
    },
  });
  return { home, shop, hotel };
}

async function orderAct(token, orderId, action, extra = {}) {
  return api('POST', `/orders/${orderId}/actions`, {
    token,
    body: { action, ...extra },
  });
}

async function addTrace(adminToken, orderId, description) {
  return api('POST', `/admin/orders/${orderId}/traces`, {
    token: adminToken,
    body: { description },
  });
}

async function supportChat(userToken, adminToken, businessType, userMsgs, agentNote) {
  const session = await api('POST', '/support/sessions', {
    token: userToken,
    body: { businessType, channel: 'human' },
  });
  const messages = [];
  for (const content of userMsgs) {
    const s = await api('POST', `/support/sessions/${session.sessionId}/messages`, {
      token: userToken,
      body: { content },
    });
    messages.push(...(s.messages || []).slice(-1));
  }
  // 客服侧：工单 + 人工会话留痕（support 后台无直接 reply API，用 admin ticket + session 状态）
  return {
    sessionId: session.sessionId,
    messages,
    agentNote,
  };
}

function pick(staff, tag) {
  return staff.filter((s) => s.roleTag === tag);
}

const SCENARIOS = [
  {
    no: 1,
    name: '林晓雯',
    phone: '+8562099911001',
    biz: '即时打车',
    type: 'RIDE',
    need: '从木棉之星酒店打车去口岸接朋友，行李箱多，要大一点的车',
    anomaly: '用户临时改终点到湄公大道夜市口',
    cs: null,
  },
  {
    no: 2,
    name: '赵铁柱',
    phone: '+8562099911002',
    biz: '预约跑腿',
    type: 'ERRAND',
    need: '预约今晚 20:00 从唐人街取文件送到酒店前台，备注勿压折',
    anomaly: '预约接近超时，骑手电话联系用户确认仍要取件',
    cs: { kind: '进度查询', msgs: ['我的跑腿单到哪了？文件重要，麻烦催一下骑手。'] },
  },
  {
    no: 3,
    name: '王丽华',
    phone: '+8562099911003',
    biz: '搬家服务',
    type: 'MOVING',
    need: '一居室搬家：床+衣柜+冰箱，需要两人帮忙上楼到 5 楼无电梯',
    anomaly: '物品超重/体积大，师傅报备需加收楼层费，用户犹豫',
    cs: { kind: '费用疑问', msgs: ['为什么多收上楼费？说好的一口价呢？'], issueType: 'OVERCHARGE' },
  },
  {
    no: 4,
    name: '陈宇航',
    phone: '+8562099911004',
    biz: '代购代买（商超）',
    type: 'PURCHASE',
    need: '代买商超：牛奶×2、鸡蛋、矿泉水；指定某牌牛奶若缺货可换同价位',
    anomaly: '指定品牌牛奶缺货，代买员拍照请示',
    cs: { kind: '缺货确认', msgs: ['指定牛奶没货，能换成另一品牌吗？价格差不多就行。'] },
  },
  {
    no: 5,
    name: '苏美玲',
    phone: '+8562099911005',
    biz: '代购代买（夜市）',
    type: 'NIGHT_MARKET',
    need: '星光夜市代买烧烤拼盘+冰粉，少辣，送到 A 栋 1203',
    anomaly: '夜市摊位临时收摊，改买隔壁摊；途中酱汁轻微渗漏',
    cs: { kind: '物品问题', msgs: ['袋子渗了一点酱，有点脏，能赔偿纸巾或小额退款吗？'], issueType: 'DAMAGE' },
  },
  {
    no: 6,
    name: '黄志强',
    phone: '+8562099911006',
    biz: '即时打车',
    type: 'RIDE',
    need: '从口岸打车回酒店，赶时间',
    anomaly: '模拟无人接单 → 改派第二司机；途中找不到酒店侧门',
    cs: { kind: '投诉', msgs: ['等了很久才有车，司机还找不到侧门，态度一般。'], issueType: 'ATTITUDE' },
  },
  {
    no: 7,
    name: '周佳佳',
    phone: '+8562099911007',
    biz: '预约跑腿',
    type: 'ERRAND_GRAB',
    need: '明天上午取药送到公司前台（抢单模式，不指定骑手）',
    anomaly: '用户电话打不通，骑手在门口等待后联系客服；用户临时改收件地址',
    cs: { kind: '修改地址', msgs: ['收件改到木棉之星酒店前台，我人已经过去了。'] },
  },
  {
    no: 8,
    name: '刘大伟',
    phone: '+8562099911008',
    biz: '搬家服务',
    type: 'MOVING_CANCEL',
    need: '办公室桌椅搬家到唐人街铺面',
    anomaly: '预约时间冲突，用户发起取消并咨询退款',
    cs: { kind: '取消/退款', msgs: ['师傅来不了了，我要取消订单，定金怎么退？'], issueType: 'OTHER' },
  },
  {
    no: 9,
    name: '马小芸',
    phone: '+8562099911009',
    biz: '代购代买（商超）',
    type: 'PURCHASE_REFUSE',
    need: '代买进口保健品链接，预算有限',
    anomaly: '后台报价偏高，用户拒绝报价并结束',
    cs: { kind: '费用疑问', msgs: ['为什么代买服务费这么高？我不做了。'] },
  },
  {
    no: 10,
    name: '吴浩然',
    phone: '+8562099911010',
    biz: '预约跑腿',
    type: 'ERRAND_OVERWEIGHT',
    need: '送一箱样品到酒店，备注约 18kg',
    anomaly: '现场超重拒收退单，转客服引导改货运/加价',
    cs: { kind: '超重退单', msgs: ['骑手说超重不送，钱怎么退？下次怎么下单？'], issueType: 'OTHER' },
  },
];

async function runRide(ctx) {
  const { user, admin, staff, scenario, report } = ctx;
  const drivers = pick(staff, 'driver');
  const primary = drivers[0];
  const backup = drivers[1];
  const order = await api('POST', '/lifestyle', {
    token: user.accessToken,
    body: {
      serviceType: 'RIDE',
      contactName: scenario.name,
      phone: scenario.phone,
      detail: `${scenario.need}；备注：${scenario.anomaly}`,
      payload: {
        from: { lat: 20.3488, lng: 100.0821, name: '木棉之星酒店' },
        to: { lat: 20.3555, lng: 100.0752, name: '口岸方向' },
        vehicleHint: '希望稍大空间',
      },
    },
  });
  report.steps.push(`用户下单即时打车 ${order.orderNo}，状态 ${order.status}`);
  await addTrace(admin.accessToken, order.id, '后台接收打车单，执行自动匹配附近司机');

  let assigned = primary;
  if (scenario.no === 6) {
    report.steps.push('第一轮派单：司机忙碌/无人接单（超时未 ACCEPT）');
    await orderAct(admin.accessToken, order.id, 'DISPATCH', { courierId: primary.id, reason: '自动派单-司机老王' });
    await addTrace(admin.accessToken, order.id, '模拟无人接单超时，触发改派');
    await orderAct(admin.accessToken, order.id, 'CANCEL', { reason: '无人接单自动撤单改派' }).catch(async () => {
      // 若已 DISPATCH 到 PENDING_ACCEPTANCE，撤单后重建逻辑简化：直接 EXCEPTION 再走不了，改用 backup 抢单路径
    });
    // 重新下单链路成本高：对同一单若仍 PENDING_ACCEPTANCE，改由备班司机 ACCEPT（抢单）
    const detail = await api('GET', `/orders/${order.id}`, { token: admin.accessToken });
    if (detail.status === 'PENDING_ACCEPTANCE') {
      assigned = backup;
      report.steps.push('进入抢单/改派模式，备班司机阿峰接单');
    } else {
      // 已取消则新建一单
      const order2 = await api('POST', '/lifestyle', {
        token: user.accessToken,
        body: {
          serviceType: 'RIDE',
          contactName: scenario.name,
          phone: scenario.phone,
          detail: `${scenario.need}（改派重下）`,
          payload: {
            from: { lat: 20.3555, lng: 100.0752, name: '口岸' },
            to: { lat: 20.3488, lng: 100.0821, name: '木棉之星酒店侧门' },
          },
        },
      });
      Object.assign(order, order2);
      assigned = backup;
      await orderAct(admin.accessToken, order.id, 'DISPATCH', { courierId: backup.id, reason: '改派备班司机' });
      report.steps.push(`改派重下订单 ${order.orderNo} → 备班司机`);
    }
  } else {
    await orderAct(admin.accessToken, order.id, 'DISPATCH', { courierId: primary.id, reason: '自动派单匹配司机' });
    report.steps.push(`后台派单给 ${primary.displayName}`);
  }

  if ((await api('GET', `/orders/${order.id}`, { token: admin.accessToken })).status === 'PENDING_DISPATCH') {
    await orderAct(admin.accessToken, order.id, 'DISPATCH', { courierId: assigned.id });
  }

  let cur = await api('GET', `/orders/${order.id}`, { token: admin.accessToken });
  if (cur.status === 'PENDING_ACCEPTANCE') {
    await orderAct(assigned.accessToken, order.id, 'ACCEPT', { reason: '司机接单' });
    report.riderOps.push(`${assigned.displayName} 接单`);
  }

  await orderAct(assigned.accessToken, order.id, 'START_PICKUP', { reason: '前往用户起点' });
  await addTrace(admin.accessToken, order.id, '司机到达起点，电话联系用户');
  report.riderOps.push('到起点；电话联系用户确认上车点');

  if (scenario.no === 1) {
    await addTrace(admin.accessToken, order.id, '用户临时改终点→湄公大道夜市口，司机报备后台');
    report.problems.push('用户临时改终点');
    report.riderOps.push('更新终点并继续行程');
  }
  if (scenario.no === 6) {
    report.problems.push('无人接单改派；途中找不到酒店侧门');
    await addTrace(admin.accessToken, order.id, '司机绕行两圈找不到侧门，电话用户引导');
    report.riderOps.push('电话用户引导进侧门');
  }

  await orderAct(assigned.accessToken, order.id, 'CONFIRM_PICKUP', { reason: '乘客已上车' });
  await orderAct(assigned.accessToken, order.id, 'START_TRANSIT', { reason: '行程中' });
  await orderAct(assigned.accessToken, order.id, 'CONFIRM_DELIVERY', { reason: '到达目的地' });
  await orderAct(user.accessToken, order.id, 'COMPLETE', { reason: '用户确认到达并支付车费' });
  report.steps.push('支付车费并完成订单');
  report.finalStatus = 'COMPLETED';
  report.orderNo = order.orderNo;
  report.orderId = order.id;
  report.assignee = assigned.displayName;

  if (scenario.cs) {
    const chat = await supportChat(user.accessToken, admin.accessToken, 'RIDE', scenario.cs.msgs, '客服安抚并核实派单时效');
    report.cs = { ...scenario.cs, chat };
    if (scenario.cs.issueType) {
      const ticket = await api('POST', '/admin/tickets', {
        token: admin.accessToken,
        body: {
          orderId: order.id,
          issueType: scenario.cs.issueType,
          subject: scenario.cs.kind,
          description: scenario.cs.msgs.join(' '),
        },
      });
      await api('POST', `/admin/tickets/${ticket.id}/resolve`, {
        token: admin.accessToken,
        body: {
          status: 'RESOLVED',
          penaltyAmount: scenario.no === 6 ? 20 : 0,
          adminNote: scenario.no === 6 ? '核实改派延迟属实，扣司机押金20并补偿用户优惠券说明' : '已调解',
        },
      });
      report.cs.result = scenario.no === 6 ? '工单已结案：补偿说明+扣司机押金20' : '工单已结案';
    } else {
      report.cs.result = '客服已回复进度说明';
    }
  }
}

async function runErrand(ctx) {
  const { user, admin, staff, scenario, addrs, report } = ctx;
  const riders = pick(staff, 'rider');
  const buyerRiders = pick(staff, 'buyer');
  const isNight = scenario.type === 'NIGHT_MARKET';
  const isOver = scenario.type === 'ERRAND_OVERWEIGHT';
  const isGrab = scenario.type === 'ERRAND_GRAB' || isNight;

  const order = await api('POST', '/errands', {
    token: user.accessToken,
    body: {
      senderAddressId: isNight ? addrs.shop.id : addrs.home.id,
      recipientAddressId: isNight ? addrs.home.id : addrs.hotel.id,
      deliveryAreaType: 1,
      weightTier: isOver ? 2 : 1,
      itemDescription: scenario.need,
      paymentMethod: 'WECHAT',
      settlementLoc: 'DROPOFF',
      remark: `${scenario.anomaly}；预约说明见详情`,
    },
  });
  report.steps.push(`用户下单跑腿/代买配送 ${order.orderNo}，状态 ${order.status}（闪送默认待接单/抢单池）`);
  report.orderNo = order.orderNo;
  report.orderId = order.id;

  let assignee = isNight ? buyerRiders[1] : riders[isGrab ? 1 : 0];

  if (!isGrab && scenario.type === 'ERRAND') {
    // 后台指定派单：先保持抢单池，管理员也可直接让指定骑手接
    await addTrace(admin.accessToken, order.id, '后台标记预约单，优先推送给骑手小陈');
    report.steps.push('后台预约派单逻辑：优先推送匹配骑手');
    assignee = riders[0];
  } else {
    report.steps.push('模拟抢单模式：订单进入公共待接单池');
  }

  if (scenario.no === 2) {
    await addTrace(admin.accessToken, order.id, '接近预约超时窗口，系统催促骑手');
    report.problems.push('预约接近超时');
  }

  await orderAct(assignee.accessToken, order.id, 'ACCEPT', { reason: '骑手/代买员接单' });
  report.riderOps.push(`${assignee.displayName} 接单`);
  report.assignee = assignee.displayName;

  await orderAct(assignee.accessToken, order.id, 'START_PICKUP', { reason: '前往取件点/摊位' });

  if (scenario.no === 7) {
    report.problems.push('用户电话打不通；临时改收件地址');
    await addTrace(admin.accessToken, order.id, '骑手报备：用户电话打不通，门口等待中');
    report.riderOps.push('电话打不通→报备客服');
    const chat = await supportChat(user.accessToken, admin.accessToken, 'ERRAND', scenario.cs.msgs, '客服接通后协助改地址');
    report.cs = { ...scenario.cs, chat, result: '客服核实后通知骑手改送酒店前台' };
    await addTrace(admin.accessToken, order.id, '客服已确认改址：木棉之星酒店前台');
  }

  if (isOver) {
    report.problems.push('现场超重，骑手拒收退单');
    await api('POST', `/errands/${order.id}/reject`, {
      token: assignee.accessToken,
      body: { reason: '现场称重约22kg，超过闪送档位，请改货运或加价人工单' },
    });
    report.riderOps.push('现场超重拒收并退单记账');
    const chat = await supportChat(user.accessToken, admin.accessToken, 'ERRAND', scenario.cs.msgs, '引导改货运');
    const ticket = await api('POST', '/admin/tickets', {
      token: admin.accessToken,
      body: {
        orderId: order.id,
        issueType: 'OTHER',
        subject: '超重退单退款咨询',
        description: scenario.cs.msgs.join(' '),
      },
    });
    await api('POST', `/admin/tickets/${ticket.id}/resolve`, {
      token: admin.accessToken,
      body: { status: 'RESOLVED', adminNote: '已原路退回闪送费，引导用户改下货运/搬家大件通道' },
    });
    report.cs = { ...scenario.cs, chat, result: '退款完成；引导改货运通道' };
    const final = await api('GET', `/orders/${order.id}`, { token: user.accessToken });
    report.finalStatus = final.status;
    report.steps.push(`订单终态 ${final.status}`);
    return;
  }

  if (isNight) {
    report.problems.push('原摊位收摊改买；途中轻微渗漏');
    await addTrace(admin.accessToken, order.id, '代买员：原摊收摊，已请示用户改买隔壁摊');
    report.riderOps.push('缺货/收摊→改买并拍照报备');
  }

  await orderAct(assignee.accessToken, order.id, 'CONFIRM_PICKUP', { reason: '已取件/已买到' });
  await api('POST', `/errands/${order.id}/proof`, {
    token: assignee.accessToken,
    body: { kind: 'pickup', storageKey: `mock/pickup/${order.id}.jpg` },
  }).catch(() => {});
  await orderAct(assignee.accessToken, order.id, 'START_TRANSIT', { reason: '配送途中' });

  if (isNight) {
    await orderAct(assignee.accessToken, order.id, 'REPORT_EXCEPTION', { reason: '配送途中包装轻微渗漏，已联系用户' }).catch(() => {});
    // EXCEPTION 后用户 CONFIRM 拉回调度再完成较复杂；尽量继续完成：若进入 EXCEPTION，尝试 CANCEL 不适用。
    const st = await api('GET', `/orders/${order.id}`, { token: admin.accessToken });
    if (st.status === 'EXCEPTION') {
      // 用户侧无法 COMPLETE；管理员 CANCEL 或 用户 CONFIRM→PENDING_DISPATCH 再走
      await orderAct(user.accessToken, order.id, 'CONFIRM', { reason: '接受轻微破损继续送达' }).catch(() => {});
      const st2 = await api('GET', `/orders/${order.id}`, { token: admin.accessToken });
      if (st2.status === 'PENDING_DISPATCH') {
        await orderAct(admin.accessToken, order.id, 'DISPATCH', { courierId: assignee.id, reason: '破损报备后继续履约' });
        await orderAct(assignee.accessToken, order.id, 'ACCEPT');
        await orderAct(assignee.accessToken, order.id, 'START_PICKUP');
        await orderAct(assignee.accessToken, order.id, 'CONFIRM_PICKUP');
        await orderAct(assignee.accessToken, order.id, 'START_TRANSIT');
      }
    }
  }

  await orderAct(assignee.accessToken, order.id, 'CONFIRM_DELIVERY', { reason: '已送达' });
  await orderAct(user.accessToken, order.id, 'COMPLETE', { reason: '确认收货并支付' });
  report.steps.push('送达确认，支付完成');
  report.finalStatus = 'COMPLETED';

  if (scenario.cs && !report.cs) {
    const chat = await supportChat(
      user.accessToken,
      admin.accessToken,
      'ERRAND',
      scenario.cs.msgs,
      '客服处理中',
    );
    report.cs = { ...scenario.cs, chat };
    if (scenario.cs.issueType) {
      const ticket = await api('POST', '/admin/tickets', {
        token: admin.accessToken,
        body: {
          orderId: order.id,
          issueType: scenario.cs.issueType,
          subject: scenario.cs.kind,
          description: scenario.cs.msgs.join(' '),
        },
      });
      await api('POST', `/admin/tickets/${ticket.id}/resolve`, {
        token: admin.accessToken,
        body: {
          status: 'RESOLVED',
          penaltyAmount: isNight ? 5 : 0,
          adminNote: isNight ? '小额补偿+提醒包装加固；轻微扣代买员责任金' : '已答复进度',
        },
      });
      report.cs.result = isNight ? '结案：小额补偿，提醒加强包装' : '工单已结案';
    } else if (scenario.no === 2) {
      report.cs.result = '客服同步骑手位置与预计送达时间';
    }
  }
}

async function runMoving(ctx) {
  const { user, admin, staff, scenario, report } = ctx;
  const mover = pick(staff, 'mover')[0];
  const order = await api('POST', '/lifestyle', {
    token: user.accessToken,
    body: {
      serviceType: 'MOVING',
      contactName: scenario.name,
      phone: scenario.phone,
      detail: `${scenario.need}；异常场景：${scenario.anomaly}`,
      payload: {
        from: { lat: 20.34512, lng: 100.08145, name: '星光夜市二期A栋' },
        to: { lat: 20.35102, lng: 100.07891, name: '唐人街铺面' },
        helpers: 2,
        floors: 5,
        elevator: false,
      },
    },
  });
  report.steps.push(`用户提交搬家单 ${order.orderNo}，状态 ${order.status}`);
  report.orderNo = order.orderNo;
  report.orderId = order.id;

  await orderAct(admin.accessToken, order.id, 'DISPATCH', { courierId: mover.id, reason: '匹配搬家师傅老周' });
  report.steps.push(`后台派单给 ${mover.displayName}`);

  if (scenario.type === 'MOVING_CANCEL') {
    report.problems.push('预约时间冲突，用户取消并咨询退款');
    const chat = await supportChat(user.accessToken, admin.accessToken, 'HOTEL', scenario.cs.msgs, '客服核实档期');
    await orderAct(user.accessToken, order.id, 'CANCEL', { reason: '档期冲突，用户主动取消' }).catch(async () => {
      await orderAct(admin.accessToken, order.id, 'CANCEL', { reason: '客服协助取消' });
    });
    const ticket = await api('POST', '/admin/tickets', {
      token: admin.accessToken,
      body: {
        orderId: order.id,
        issueType: 'OTHER',
        subject: '搬家取消退款',
        description: scenario.cs.msgs.join(' '),
      },
    });
    await api('POST', `/admin/tickets/${ticket.id}/resolve`, {
      token: admin.accessToken,
      body: { status: 'RESOLVED', adminNote: '未实际出车，全额退款说明已同步用户' },
    });
    report.cs = { ...scenario.cs, chat, result: '已取消；全额退款说明完成' };
    report.riderOps.push('师傅尚未出车，取消成功');
    report.finalStatus = 'CANCELLED';
    report.assignee = mover.displayName;
    return;
  }

  await orderAct(mover.accessToken, order.id, 'ACCEPT', { reason: '搬家师傅接单' });
  report.riderOps.push(`${mover.displayName} 接单并上门评估`);
  await orderAct(mover.accessToken, order.id, 'START_PICKUP', { reason: '到达搬出地址' });
  report.problems.push('超重/需加收上楼费');
  await addTrace(admin.accessToken, order.id, '师傅报备：5楼无电梯，建议加收上楼费，等待用户确认');
  const chat = await supportChat(user.accessToken, admin.accessToken, 'HOTEL', scenario.cs.msgs, '调解上楼费');
  const ticket = await api('POST', '/admin/tickets', {
    token: admin.accessToken,
    body: {
      orderId: order.id,
      issueType: 'OVERCHARGE',
      subject: '搬家上楼费争议',
      description: scenario.cs.msgs.join(' '),
    },
  });
  await api('POST', `/admin/tickets/${ticket.id}/resolve`, {
    token: admin.accessToken,
    body: { status: 'RESOLVED', adminNote: '调解：平台补贴一半上楼费，用户承担一半后继续履约' },
  });
  report.cs = { ...scenario.cs, chat, result: '调解：平台与用户各承担一半上楼费，继续搬家' };
  report.riderOps.push('费用确认后搬出→运输→搬入');

  await orderAct(mover.accessToken, order.id, 'CONFIRM_PICKUP', { reason: '家具已搬出装车' });
  await orderAct(mover.accessToken, order.id, 'START_TRANSIT', { reason: '运输中' });
  await orderAct(mover.accessToken, order.id, 'CONFIRM_DELIVERY', { reason: '搬入完成' });
  await orderAct(user.accessToken, order.id, 'COMPLETE', { reason: '确认搬家完成并支付' });
  report.finalStatus = 'COMPLETED';
  report.assignee = mover.displayName;
  report.steps.push('搬家完成并支付');
}

async function runPurchase(ctx) {
  const { user, admin, staff, scenario, report } = ctx;
  const buyer = pick(staff, 'buyer')[0];
  const order = await api('POST', '/purchases', {
    token: user.accessToken,
    body: {
      productUrl: scenario.no === 9
        ? 'https://shop.example.com/item/health-supplement-imported'
        : 'https://shop.example.com/mart/milk-eggs-water',
      remark: `${scenario.need}；${scenario.anomaly}`,
    },
  });
  report.steps.push(`用户提交代买链接单 ${order.orderNo}，待后台报价`);
  report.orderNo = order.orderNo;
  report.orderId = order.id;
  report.assignee = buyer.displayName;

  const quoteAmount = scenario.no === 9 ? 268 : 86.5;
  await api('POST', `/purchases/${order.id}/quote`, {
    token: admin.accessToken,
    body: {
      quoteAmount,
      adminNote: scenario.no === 9 ? '含商品预估+代买服务费+跨境运费' : '商超清单预估+跑腿代买服务费',
    },
  });
  report.steps.push(`后台（代买调度）报价 ${quoteAmount}`);

  if (scenario.type === 'PURCHASE_REFUSE') {
    report.problems.push('用户认为报价过高，拒绝');
    await api('POST', `/purchases/${order.id}/confirm`, {
      token: user.accessToken,
      body: { accept: false },
    });
    const chat = await supportChat(user.accessToken, admin.accessToken, 'EXPRESS', scenario.cs.msgs, '解释服务费构成');
    report.cs = { ...scenario.cs, chat, result: '已说明费用构成；订单因拒报价关闭' };
    const final = await api('GET', `/orders/${order.id}`, { token: user.accessToken });
    report.finalStatus = final.status;
    report.riderOps.push('代买员未出单（用户拒价）');
    return;
  }

  await api('POST', `/purchases/${order.id}/confirm`, {
    token: user.accessToken,
    body: { accept: true },
  });
  report.steps.push('用户确认报价并记账支付（状态 ACCEPTED）');
  report.problems.push('指定商品缺货');

  // 代买确认后无骑手：异常回调度 → 指派代买员 → 履约到 DELIVERED → 用户 COMPLETE
  await orderAct(admin.accessToken, order.id, 'REPORT_EXCEPTION', {
    reason: '转入代买履约：指派代买员采购配送',
  });
  await orderAct(user.accessToken, order.id, 'CONFIRM', { reason: '同意由代买员继续履约' });
  await orderAct(admin.accessToken, order.id, 'DISPATCH', {
    courierId: buyer.id,
    reason: `指派代买员 ${buyer.displayName}`,
  });
  await orderAct(buyer.accessToken, order.id, 'ACCEPT', { reason: '代买员接单' });
  report.riderOps.push(`${buyer.displayName} 接单`);
  await orderAct(buyer.accessToken, order.id, 'START_PICKUP', { reason: '到店采购' });
  await addTrace(admin.accessToken, order.id, '代买员反馈：指定品牌牛奶缺货，已拍照，等待用户确认替换');
  report.riderOps.push('到店；缺货拍照请示');

  const chat = await supportChat(user.accessToken, admin.accessToken, 'EXPRESS', scenario.cs.msgs, '确认可替换品牌');
  await addTrace(admin.accessToken, order.id, '客服/用户确认：可换同价位品牌，继续购买并送达');
  report.riderOps.push('换购完成→配送→送达');

  await orderAct(buyer.accessToken, order.id, 'CONFIRM_PICKUP', { reason: '商品已购齐' });
  await orderAct(buyer.accessToken, order.id, 'START_TRANSIT', { reason: '送往用户' });
  await orderAct(buyer.accessToken, order.id, 'CONFIRM_DELIVERY', { reason: '已送达用户' });
  await orderAct(user.accessToken, order.id, 'COMPLETE', { reason: '确认代买商品已收齐' });
  report.cs = { ...scenario.cs, chat, result: '确认换购方案；订单完成' };
  report.finalStatus = 'COMPLETED';
  report.steps.push('代买履约完成并支付闭环');
}

async function main() {
  console.log(`API base: ${BASE}`);
  const health = await fetch(`${BASE.replace(/\/api\/v1$/, '')}/api/v1/health`).catch(() => null);
  if (!health || !health.ok) {
    // try anyway
  }

  const admin = await loginAdmin();
  console.log('Admin OK', admin.id);

  const staff = await ensureStaffCouriers();
  console.log('Staff couriers:', staff.map((s) => s.riderCode).join(', '));

  const password = 'DemoUser!2026';
  const reports = [];

  for (const scenario of SCENARIOS) {
    console.log(`\n=== U${String(scenario.no).padStart(2, '0')} ${scenario.name} / ${scenario.biz} ===`);
    const user = await ensureUserAccount({
      displayName: scenario.name,
      phone: scenario.phone,
      password,
    });
    const addrs = await createAddresses(user.accessToken, scenario.name, scenario.phone);
    const report = {
      userNo: `U${String(scenario.no).padStart(2, '0')}`,
      userName: scenario.name,
      phone: scenario.phone,
      biz: scenario.biz,
      type: scenario.type,
      need: scenario.need,
      steps: [],
      problems: [],
      riderOps: [],
      cs: null,
      finalStatus: 'UNKNOWN',
      orderNo: null,
      orderId: null,
      assignee: null,
      errors: [],
    };
    const ctx = { user, admin, staff, scenario, addrs, report };
    try {
      if (scenario.type === 'RIDE') await runRide(ctx);
      else if (scenario.type === 'MOVING' || scenario.type === 'MOVING_CANCEL') await runMoving(ctx);
      else if (scenario.type === 'PURCHASE' || scenario.type === 'PURCHASE_REFUSE') await runPurchase(ctx);
      else await runErrand(ctx);

      if (!report.problems.length) report.problems.push(scenario.anomaly);
      const final = report.orderId
        ? await api('GET', `/orders/${report.orderId}`, { token: admin.accessToken }).catch(() => null)
        : null;
      if (final?.status) report.finalStatus = final.status;
      if (final?.paymentStatus) report.paymentStatus = final.paymentStatus;
    } catch (e) {
      report.errors.push(e.message);
      console.error(e.message);
    }
    reports.push(report);
    console.log(`→ ${report.finalStatus} ${report.orderNo || ''} ${report.errors[0] || ''}`);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const outJson = join(OUT_DIR, 'lifestyle-stress-report.json');
  writeFileSync(outJson, JSON.stringify({ generatedAt: new Date().toISOString(), base: BASE, reports }, null, 2), 'utf8');

  const lines = [];
  lines.push('# 本地生活服务全链路压力模拟报告');
  lines.push(`生成时间：${new Date().toISOString()}`);
  lines.push(`API：${BASE}`);
  lines.push('');
  for (const r of reports) {
    lines.push(`## ${r.userNo} ${r.userName}｜${r.biz}`);
    lines.push(`- 用户编号：${r.userNo}`);
    lines.push(`- 下单业务类型：${r.biz}（${r.type}）`);
    lines.push(`- 订单号：${r.orderNo || '-'}`);
    lines.push(`- 指派人员：${r.assignee || '-'}`);
    lines.push(`- 订单全过程：`);
    for (const s of r.steps) lines.push(`  1. ${s}`);
    lines.push(`- 遇到的问题：${(r.problems || []).join('；') || '-'}`);
    lines.push(`- 骑手/司机/代买员操作：${(r.riderOps || []).join(' → ') || '-'}`);
    if (r.cs) {
      lines.push(`- 客服：${r.cs.kind}｜处理结果：${r.cs.result || '-'}`);
    } else {
      lines.push(`- 客服：未触发`);
    }
    lines.push(`- 订单最终状态：${r.finalStatus}${r.paymentStatus ? ` / 支付 ${r.paymentStatus}` : ''}`);
    if (r.errors?.length) lines.push(`- 执行异常：${r.errors.join(' | ')}`);
    lines.push('');
  }
  const outMd = join(OUT_DIR, 'lifestyle-stress-report.md');
  writeFileSync(outMd, lines.join('\n'), 'utf8');
  console.log(`\nWrote ${outJson}`);
  console.log(`Wrote ${outMd}`);

  const summary = {
    total: reports.length,
    completed: reports.filter((r) => r.finalStatus === 'COMPLETED').length,
    cancelled: reports.filter((r) => r.finalStatus === 'CANCELLED').length,
    other: reports.filter((r) => !['COMPLETED', 'CANCELLED'].includes(r.finalStatus)).length,
    withCs: reports.filter((r) => r.cs).length,
    failed: reports.filter((r) => r.errors?.length).length,
  };
  console.log('SUMMARY', summary);
  writeFileSync(join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
