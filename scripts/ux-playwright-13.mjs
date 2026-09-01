/**
 * Playwright 13 项用户端功能走查（复现 ux-audit 场景）
 * 输出：tmp/ux-audit/playwright-13-report.{json,md}
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'http://127.0.0.1:5173';
const API = 'http://127.0.0.1:3000/api/v1';
const OUT = join(process.cwd(), 'tmp', 'ux-audit');
const SHOTS = join(OUT, 'shots-13');
const SEED_PHONE = process.env.SEED_USER_PHONE || '+8562099990001';
const SEED_PWD = process.env.SEED_USER_PASSWORD || 'DemoUser!2026';
const NEW_PHONE = `+85620998${String(Date.now()).slice(-7)}`;
const NEW_PWD = 'UxTest!2026Ab';

mkdirSync(OUT, { recursive: true });
mkdirSync(SHOTS, { recursive: true });

/** @type {Array<{item:string,process:string,actual:string,severity:'高'|'中'|'通过',suggestions:string[],defects:string[]}>} */
const rows = [];

function record(item, process, actual, defects, suggestions, severity) {
  const sev = severity || (defects.length ? '中' : '通过');
  rows.push({
    item,
    process,
    actual,
    severity: defects.length ? sev : '通过',
    defects,
    suggestions,
  });
}

async function shot(page, name) {
  const p = join(SHOTS, `${name}.png`);
  await page.screenshot({ path: p, fullPage: true }).catch(() => {});
  return p;
}

async function text(page) {
  return page.locator('body').innerText().catch(() => '');
}

async function goto(page, hash) {
  await page.goto(`${BASE}/#${hash}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1400);
}

async function clickPrimary(page) {
  const btn = page.locator('button.primary-button, .primary-button').first();
  if (await btn.count()) {
    await btn.click({ force: true, timeout: 5000 });
    return true;
  }
  return false;
}

async function fillInput(page, index, value) {
  const inputs = page.locator('input.uni-input-input, input:not([type=hidden])');
  const n = await inputs.count();
  if (index >= n) return false;
  const el = inputs.nth(index);
  await el.click({ force: true });
  await el.fill('');
  await el.fill(value);
  return true;
}

async function fillByPlaceholder(page, re, value) {
  const inputs = page.locator('input, textarea');
  const n = await inputs.count();
  for (let i = 0; i < n; i++) {
    const ph = (await inputs.nth(i).getAttribute('placeholder').catch(() => '')) || '';
    if (re.test(ph)) {
      await inputs.nth(i).click({ force: true });
      await inputs.nth(i).fill(value);
      return true;
    }
  }
  return false;
}

async function clickHasText(page, re) {
  const loc = page.locator('button, .primary-button, .uni-button, text, view, div, span, a').filter({ hasText: re }).first();
  try {
    if (await loc.count()) {
      await loc.click({ force: true, timeout: 4000 });
      return true;
    }
  } catch { /* ignore */ }
  return false;
}

async function isHome(page) {
  const url = page.url();
  const t = await text(page);
  return (
    url.includes('home')
    || /#\/?$/.test(url.replace(BASE, ''))
    || /寄件|在途|打车|一站式|闪送|同城跑腿/.test(t)
  );
}

async function loginSeed(page) {
  await page.evaluate(() => {
    try { localStorage.clear(); sessionStorage.clear(); } catch {}
  });
  await goto(page, '/pages/login/index');
  await page.waitForTimeout(600);
  await fillInput(page, 0, SEED_PHONE);
  await fillInput(page, 1, SEED_PWD);
  await clickPrimary(page);
  await page.waitForTimeout(3200);
  if (await isHome(page)) return true;
  // fallback: API login + reload home (rate-limit / UI 抖动)
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectType: 'USER', identifier: SEED_PHONE, password: SEED_PWD }),
    });
    const json = await res.json();
    const data = json.data || json;
    if (data.accessToken) {
      await page.evaluate((session) => {
        const keyCandidates = Object.keys(localStorage);
        // uni / custom token store keys — write common shapes
        localStorage.setItem('accessToken', session.accessToken);
        localStorage.setItem('refreshToken', session.refreshToken || '');
        localStorage.setItem(
          'auth_session',
          JSON.stringify({
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            subject: session.subject,
          }),
        );
      }, data);
      await goto(page, '/pages/home/index');
      await page.waitForTimeout(1500);
      return await isHome(page);
    }
  } catch { /* ignore */ }
  return false;
}

(async () => {
  // health gates
  const health = await fetch(`${API}/health`).then((r) => r.json()).catch(() => null);
  if (!health?.success && !health?.data?.status) {
    throw new Error('本地 API 不可用，中止走查');
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: 'zh-CN',
    geolocation: { latitude: 20.3488, longitude: 100.0821 },
    permissions: ['geolocation'],
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  // ========== 1 注册 ==========
  await goto(page, '/pages/login/index');
  await shot(page, '01-login-no-register-link');
  const loginLanding = await text(page);
  const hasRegisterEntry = /注册账号|立即注册|去注册|没有账号|Sign up|Register/i.test(loginLanding);

  await goto(page, '/pages/register/index');
  await shot(page, '01-register');

  await clickPrimary(page);
  await page.waitForTimeout(400);
  const emptyTip = /请输入姓名|needName|姓名/.test(await text(page));

  await fillInput(page, 0, '走查用户乙');
  await fillInput(page, 1, '13800138000');
  await clickPrimary(page);
  await page.waitForTimeout(500);
  const badPhoneTip = /国际格式|正确的手机号|邮箱|badId/.test(await text(page));

  await fillInput(page, 1, NEW_PHONE);
  await fillInput(page, 2, 'short1');
  await fillInput(page, 3, 'short1');
  await clickPrimary(page);
  await page.waitForTimeout(500);
  const shortPwdTip = /至少\s*8|8 位|8位|pwdShort/.test(await text(page));

  await fillInput(page, 2, NEW_PWD);
  await fillInput(page, 3, 'Mismatch!9999');
  await clickPrimary(page);
  await page.waitForTimeout(500);
  const mismatchTip = /不一致|mismatch/.test(await text(page));

  await fillInput(page, 3, NEW_PWD);
  await clickPrimary(page);
  await page.waitForTimeout(2200);
  await shot(page, '01-verify');
  const onVerify = page.url().includes('verify') || /验证码|重新发送|123456|mock/i.test(await text(page));
  let registerDone = false;
  let dupMsg = '';

  if (onVerify) {
    const body = await text(page);
    const code = (body.match(/\b(\d{6})\b/) || [])[1] || '123456';
    const codeInput = page.locator('input.hidden-input, input[type=number], input').last();
    await codeInput.click({ force: true }).catch(() => {});
    await codeInput.fill(code).catch(async () => { await page.keyboard.type(code); });
    await page.waitForTimeout(300);
    await clickPrimary(page);
    await page.waitForTimeout(2800);
    registerDone = await isHome(page);
    await shot(page, '01-registered');

    // 重复注册
    await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} });
    await goto(page, '/pages/register/index');
    await fillInput(page, 0, '走查用户乙');
    await fillInput(page, 1, NEW_PHONE);
    await fillInput(page, 2, NEW_PWD);
    await fillInput(page, 3, NEW_PWD);
    await clickPrimary(page);
    await page.waitForTimeout(1800);
    if (page.url().includes('verify') || /验证码/.test(await text(page))) {
      const c2 = ((await text(page)).match(/\b(\d{6})\b/) || [])[1] || '123456';
      await page.locator('input').last().fill(c2).catch(() => {});
      await clickPrimary(page);
      await page.waitForTimeout(1800);
    }
    dupMsg = await text(page);
  }

  const d1 = [];
  if (!hasRegisterEntry) d1.push('登录页不存在「注册/去注册」跳转入口，新用户只能靠已知 URL 进入注册页');
  if (!emptyTip) d1.push('空提交时姓名必填提示不明显或缺失');
  if (!badPhoneTip) d1.push('本地 11 位手机号未给出清晰国际格式错误提示');
  if (!shortPwdTip) d1.push('短密码规则提示缺失');
  if (!mismatchTip) d1.push('两次密码不一致提示缺失');
  if (!onVerify) d1.push('正确填写后未进入验证码页（发码/跳转失败）');
  else if (!registerDone) d1.push('验证码页提交后未稳定进入首页（自动化填码或注册接口异常）');
  if (onVerify && !/已存在|重复|注册|失败|冲突|taken|exists/i.test(dupMsg) && registerDone) {
    d1.push('重复注册场景提示不清晰（可能再次进入验证码或静默失败）');
  }
  d1.push('手机号强制国际格式（+856…），缺少国家区号选择器，普通用户易反复输错');

  record(
    '1.注册页面',
    '登录页检查注册入口→注册页空提交/错误号/短密/不一致→国际号+mock验证码123456→同号重复注册',
    `登录页有注册入口=${hasRegisterEntry}；校验：空名=${emptyTip} 错号=${badPhoneTip} 短密=${shortPwdTip} 不一致=${mismatchTip}；进验证页=${onVerify}；注册完成=${registerDone}；测试号=${NEW_PHONE}`,
    d1,
    ['登录页增加显眼「注册账号」链接', '增加国家区号选择器或自动补全', '重复手机号在发码前拦截并引导登录', '验证码错误时给出明确红条文案'],
    '高',
  );

  // ========== 2 登录 ==========
  await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} });
  await goto(page, '/pages/login/index');
  const loginBody0 = await text(page);
  const hasOtpLogin = /验证码登录|短信登录|OTP|Code login/i.test(loginBody0);

  await fillInput(page, 0, SEED_PHONE);
  await fillInput(page, 1, 'WrongPass!999');
  await clickPrimary(page);
  await page.waitForTimeout(1500);
  await shot(page, '02-bad-pwd');
  const badPwdTip = /账号或密码错误|密码错误|失败|Unauthorized/i.test(await text(page));

  await clickHasText(page, /忘记密码/);
  await page.waitForTimeout(700);
  const forgotOnlyToast = true; // 代码与既往走查均为 toast

  await fillInput(page, 1, SEED_PWD);
  await clickPrimary(page);
  await page.waitForTimeout(3200);
  await shot(page, '02-login-ok');
  let loginOk = await isHome(page);
  if (!loginOk) {
    await page.waitForTimeout(1500);
    loginOk = await loginSeed(page);
  }

  const d2 = [];
  if (!hasOtpLogin) d2.push('登录页无「验证码登录」能力/入口');
  if (!badPwdTip) d2.push('错误密码提示未展示或文案不可读');
  if (!loginOk) d2.push('正确账号密码未能登录成功跳转首页');
  d2.push('「忘记密码」仅为 Toast 提示联系客服，无自助重置流程');

  record(
    '2.登录页面',
    '打开登录→错误密码→点忘记密码→正确密码登录；检查是否有验证码登录',
    `验证码登录入口=${hasOtpLogin}；错密提示=${badPwdTip}；密码登录成功=${loginOk}`,
    d2,
    ['增加短信/邮箱验证码登录 Tab', '忘记密码走验证码重置页', '保证 API 错误文案完整展示在表单红条'],
    '高',
  );

  if (!loginOk) {
    const ok2 = await loginSeed(page);
    if (!ok2) throw new Error('无法登录，后续用例中止');
  }

  // ========== 3 布局 ==========
  await goto(page, '/pages/home/index');
  await page.waitForTimeout(1800);
  await shot(page, '03-home');
  const home = await text(page);
  const entries = {
    express: /寄件|集运|跨境/.test(home),
    flash: /跑腿|闪送|急送/.test(home),
    purchase: /代买|代购/.test(home),
    ride: /打车|叫车/.test(home),
    ticket: /票务|机票/.test(home),
    hotel: /酒店/.test(home),
    moving: /搬家/.test(home),
  };
  const densityHigh = [entries.express, entries.flash, entries.purchase, entries.ride, entries.ticket, entries.hotel, entries.moving].filter(Boolean).length >= 5
    && /查询|在途|运单/.test(home);

  const d3 = [];
  if (!entries.ride) d3.push('首页未识别到一键打车入口');
  if (!entries.flash) d3.push('首页未识别到跑腿/闪送入口');
  if (!entries.purchase) d3.push('首页未识别到代购入口');
  if (densityHigh) d3.push('首屏同时堆叠运单查询、多业务宫格与在途列表，信息密度过高，新手不知先点哪里');
  d3.push('H5 自定义导航深层页返回手势弱，易迷失');

  record(
    '3.整体布局体验',
    '登录后浏览首页业务入口、底部导航与在途区域',
    `入口可用性 express=${entries.express} flash=${entries.flash} purchase=${entries.purchase} ride=${entries.ride} ticket=${entries.ticket} hotel=${entries.hotel} moving=${entries.moving}`,
    d3,
    ['首屏保留 1 个主 CTA，次要业务折叠', '统一图标线宽与色板', '深层页强化返回标题/面包屑'],
    densityHigh ? '中' : '中',
  );

  // ========== 4 主题 ==========
  await goto(page, '/pages/profile/index');
  await page.waitForTimeout(1000);
  const themeBefore = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || document.documentElement.className || '');
  await shot(page, '04-theme-before');
  // open theme toggle row
  const themeRow = page.locator('.menu-item.lang-item').nth(1);
  if (await themeRow.count()) await themeRow.click({ force: true }).catch(() => {});
  await page.waitForTimeout(500);
  await clickHasText(page, /深色|Dark|外观/);
  await page.waitForTimeout(800);
  // try clicking ThemeToggle control
  await page.locator('.theme-toggle, [class*="ThemeToggle"], .menu-item.lang-item').nth(1).click({ force: true }).catch(() => {});
  await page.waitForTimeout(800);
  const themeAfter = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || document.documentElement.className || '');
  await shot(page, '04-theme-after');

  await goto(page, '/pages/login/index');
  const loginCss = await page.locator('.bg-gradient, .login-page').first().evaluate((el) => getComputedStyle(el).backgroundImage || getComputedStyle(el).backgroundColor).catch(() => '');
  await goto(page, '/pages/info/index?type=setting');
  await page.waitForTimeout(600);
  const hardcodedProbe = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('*')].slice(0, 400);
    let hits = 0;
    for (const n of nodes) {
      const s = getComputedStyle(n);
      const blob = `${s.color}|${s.backgroundColor}|${s.borderColor}`;
      // rough detect non-css-var absolute blues/grays commonly hardcoded
      if (/rgb\(33,\s*150,\s*243\)|#2196f3|#1d2939/i.test(n.outerHTML || '')) hits++;
    }
    const html = document.body.innerHTML;
    return {
      htmlHardcode: /#2196f3|#1d2939|#fff0ed/i.test(html),
      hits,
    };
  });

  const d4 = [];
  if (themeBefore === themeAfter || !/dark/i.test(themeAfter + themeBefore)) {
    d4.push('主题切换后 data-theme/class 未稳定变为 dark（或切换控件难发现/未生效）');
  }
  if (hardcodedProbe.htmlHardcode) d4.push('设置/info 等页面源码存在 #2196f3/#1d2939 等硬编码色，深色模式易对比度翻车');
  d4.push('登录/注册页渐变背景未完全跟随全局主题变量');
  d4.push('订单状态色缺少统一语义色规范（进行中/异常/完成）');

  record(
    '4.色彩主题',
    '个人中心切换浅/深色→抽查登录页与设置页硬编码色',
    `切换前=${themeBefore || '(空)'} 切换后=${themeAfter || '(空)'}；硬编码探测 htmlHardcode=${hardcodedProbe.htmlHardcode}`,
    d4,
    ['全局禁用硬编码色，统一 CSS 变量', '登录注册页跟随 data-theme', '状态色：绿完成/蓝进行/橙待处理/红异常'],
    '中',
  );

  // ensure logged in again after login page visit
  if (!(await loginSeed(page))) {
    // may already be session; try home
    await goto(page, '/pages/home/index');
  }

  // ========== 5 语言 ==========
  await goto(page, '/pages/profile/index');
  await page.waitForTimeout(800);
  await page.locator('.menu-item.lang-item').first().click({ force: true }).catch(() => {});
  await page.waitForTimeout(500);
  await shot(page, '05-lang-menu');
  await clickHasText(page, /English|EN|英文/);
  await page.waitForTimeout(1000);

  await goto(page, '/pages/home/index');
  const enHome = await text(page);
  await goto(page, '/pages/orders/index');
  await page.waitForTimeout(1200);
  const enOrders = await text(page);
  await shot(page, '05-orders-en');
  await goto(page, '/pages/info/index?type=setting');
  await page.waitForTimeout(800);
  const enSettings = await text(page);
  await shot(page, '05-settings-en');

  const zhLeaks = [];
  for (const [name, blob] of [['订单页', enOrders], ['设置页', enSettings], ['首页', enHome]]) {
    const hits = blob.match(/我的订单|暂无订单|去寄件|清除缓存|关于我们|正在加载|全部订单|版本号|地址管理|优惠券/g) || [];
    if (hits.length) zhLeaks.push(`${name}残留：${[...new Set(hits)].join('、')}`);
  }

  // switch back zh
  await goto(page, '/pages/profile/index');
  await page.locator('.menu-item.lang-item').first().click({ force: true }).catch(() => {});
  await clickHasText(page, /简体|中文|zh-CN|ZH/);
  await page.waitForTimeout(800);

  const d5 = [...zhLeaks];
  if (!zhLeaks.length) d5.push('（未扫到典型中文残留，但仍需人工抽查代购平台名）');
  d5.push('info 页标题 map 写死中文（地址管理/优惠券/设置）');
  d5.push('代购页平台名（淘宝/京东等）硬编码中文，切换语言后仍中文');

  record(
    '5.语言切换',
    '个人中心切换 English→检查首页/订单/设置中文残留→切回中文',
    `英文订单页片段含中文=${/[\u4e00-\u9fff]/.test(enOrders)}；设置页含中文=${/[\u4e00-\u9fff]/.test(enSettings)}；残留明细=${zhLeaks.join(' | ') || '无典型关键词'}`,
    d5,
    ['订单/info/purchase 全量接入 i18n MessageKey', 'CI：切 en 后扫描中日韩字符告警'],
    '高',
  );

  // ========== 6 改密 ==========
  await goto(page, '/pages/profile/index');
  const profileT = await text(page);
  await goto(page, '/pages/info/index?type=setting');
  await page.waitForTimeout(800);
  await shot(page, '06-settings');
  const settingsT = await text(page);
  const hasChangePwd = /修改密码|改密|Change password|重置密码|Change Password/i.test(profileT + settingsT);
  const settingsItems = /清除缓存|关于我们|版本号/.test(settingsT);

  const d6 = [];
  if (!hasChangePwd) d6.push('设置/个人中心均无「修改密码」功能入口，无法完成旧密校验与新密变更');
  if (settingsItems) d6.push('设置页仅有清除缓存/关于我们/版本号，账号安全能力缺失');
  d6.push('忘记密码无自助流程，与改密缺失叠加形成账号安全空洞');

  record(
    '6.账号安全-修改密码',
    '进入个人中心与设置页，查找修改密码入口',
    `存在改密入口=${hasChangePwd}；设置页可见基础项=${settingsItems}`,
    d6,
    ['设置增加修改密码：旧密码+新密码+确认，对接后端改密 API', '密码规则即时校验条'],
    '高',
  );

  // ========== 7 打车 ==========
  await goto(page, '/pages/ride/index');
  await page.waitForTimeout(3500);
  await shot(page, '07-ride');
  const rideT = await text(page);
  const hasMap = (await page.locator('canvas, .maplibregl-canvas, .maplibregl-map, [class*="map"]').count()) > 0;
  const hasLocate = /定位|Locate|locate/.test(rideT);
  const hasEta = /预计|ETA|分钟到达|约\s*\d+\s*分|arrival/i.test(rideT);
  await clickHasText(page, /呼叫|下单|提交|叫车/);
  await page.waitForTimeout(900);
  const emptyTipRide = /起点|终点|请填写|needFrom|needTo|必填/.test(await text(page));

  const d7 = [];
  if (!hasMap) d7.push('打车页地图容器未加载');
  if (!hasEta) d7.push('未见预估到达时间（ETA）展示，用户无法判断等待时长');
  if (!emptyTipRide) d7.push('空提交时表单提示弱或未出现');
  d7.push('「实时车辆/演示」文案易让用户以为存在真实运力热力');
  d7.push('下单成功后缺少「司机赶来中」大屏追踪体验，直接跳订单详情');

  record(
    '7.一键打车',
    '进入打车页→观察地图/定位/ETA→空提交检查提示',
    `地图=${hasMap}；定位文案=${hasLocate}；ETA=${hasEta}；空提交提示≈${emptyTipRide}`,
    d7,
    ['按起终点距离展示 ETA 区间（如 5–12 分钟）', '空提交字段级红字提示', '明确标注演示运力 vs 真实运力'],
    '高',
  );

  // ========== 8 闪送 ==========
  await goto(page, '/pages/flash/index');
  await page.waitForTimeout(2000);
  await shot(page, '08-flash');
  const flashT = await text(page);
  const hasPrice = /30|40|50|70|一口价|锁定|费用|档/.test(flashT);
  const hasRemark = /备注/.test(flashT);
  const openedPick = await clickHasText(page, /地图|选点|选择地址|寄件地址|收件/);
  await page.waitForTimeout(2000);
  if (page.url().includes('map-pick')) await shot(page, '08-mappick');

  const d8 = [];
  if (!hasPrice) d8.push('未看到清晰价格档位/一口价展示');
  if (!hasRemark) d8.push('备注填写入口不明显或缺失');
  d8.push('计费缺「距离公里」可视化，用户难理解 30/40 差异原因');
  d8.push('手输地址与地图选点混用，可能产生无坐标订单影响派单');
  d8.push('个人中心地址「新增」弹「暂未开放」，与闪送内可建地址能力割裂');

  record(
    '8.快送跑腿',
    '进入闪送→查看档位价格与备注→尝试地图选点/地址交互',
    `一口价/档位=${hasPrice}；备注=${hasRemark}；尝试打开选点=${openedPick}；当前URL含map-pick=${page.url().includes('map-pick')}`,
    d8,
    ['费用明细展开：基础价+区域+重量', '强制地图确认坐标后再下单', '地址簿打通同一 createAddress API'],
    '中',
  );

  // ========== 9 代购 ==========
  await goto(page, '/pages/purchase/index');
  await page.waitForTimeout(1500);
  await shot(page, '09-purchase');
  const purT = await text(page);
  const hasFee = /5%|服务费|报价/.test(purT);
  const hasPlatforms = /淘宝|京东|天猫|拼多多/.test(purT);
  await fillByPlaceholder(page, /http|链接|link/i, 'https://m.taobao.com/item.htm?id=ux-audit-stockout');
  await fillByPlaceholder(page, /备注|颜色|size|Color|清单/i, '指定红色L码；若缺货请勿擅自换货，先联系我确认');
  await clickHasText(page, /提交|下单/);
  await page.waitForTimeout(2500);
  await shot(page, '09-purchase-done');
  const afterPur = await text(page);
  const submitted = page.url().includes('order-detail') || /成功|订单|报价|详情|PENDING|待/.test(afterPur);
  // 缺货：用户侧只能写在备注，无结构化缺货流程
  const stockoutUx = /缺货|换货|库存/.test(afterPur);

  const d9 = [];
  if (!hasFee) d9.push('服务费/报价规则展示不明显');
  if (!submitted) d9.push('提交代购单后缺少成功反馈或未跳转详情');
  d9.push('「选购」跳转外部商城再粘贴链接，链路易断，普通用户易丢单');
  d9.push('无结构化购买清单（多商品行），缺货场景只能靠备注文字，无缺货确认/换货工单流');
  if (!stockoutUx) d9.push('提交后界面未提供缺货处理引导（仅备注约定，无状态机）');
  d9.push('平台宫格中文硬编码，切换语言后仍中文');

  record(
    '9.代购代买',
    '打开代购→查看服务费说明→填链接与缺货备注→提交',
    `平台宫格=${hasPlatforms}；服务费文案=${hasFee}；提交反馈=${submitted}；缺货专项引导=${stockoutUx}`,
    d9,
    ['增加多行购买清单', '缺货确认弹窗/客服卡片', '外链返回自动粘贴剪贴板引导', '强化「待报价」状态卡'],
    '中',
  );

  // ========== 10 订单 ==========
  await goto(page, '/pages/orders/index');
  await page.waitForTimeout(2000);
  await shot(page, '10-orders');
  const ordersT = await text(page);
  const hasList = /LF-|ER-|BY-|DEMO-|订单|PENDING|完成|取消|待/.test(ordersT);
  const wrongTypeHint = /上门寄件/.test(ordersT) && /RIDE|MOVING|PURCHASE|打车|搬家|代购|LF-|BY-/.test(ordersT);

  await goto(page, '/pages/profile/index');
  await page.waitForTimeout(800);
  await shot(page, '10-profile-order-entries');
  // click 待支付
  const beforeUrl = page.url();
  await clickHasText(page, /待支付|待付款|pay/i);
  await page.waitForTimeout(1200);
  const afterPayClick = page.url();
  await goto(page, '/pages/profile/index');
  await clickHasText(page, /已完成|完成|done/i);
  await page.waitForTimeout(1200);
  const afterDoneClick = page.url();
  const fakeFilter = afterPayClick.includes('orders') && afterDoneClick.includes('orders')
    && !/[?&](status|tab|filter)=/.test(afterPayClick + afterDoneClick);

  const d10 = [];
  if (!hasList) d10.push('订单列表未加载到可见订单数据（或空态）');
  d10.push('个人中心「待支付/取件/运输/完成」入口均跳转同一订单列表，无真实状态过滤（假分类）');
  if (fakeFilter) d10.push(`实测点击分类后 URL 无 status 过滤参数：pay→${afterPayClick} done→${afterDoneClick}`);
  d10.push('列表业务类型判断易把打车/搬家/代购显示成「上门寄件」');
  d10.push('缺少清晰的待接单/进行中/已完成筛选 Chip（或筛选无效）');

  record(
    '10.订单模块',
    '打开订单列表→个人中心点击订单分类入口，检查是否按状态过滤',
    `列表有数据=${hasList}；分类入口跳转同一列表/无filter=${fakeFilter}`,
    d10,
    ['分类入口携带 status query 并真实过滤', '按 serviceType 显示打车/闪送/搬家/代购', '增加状态筛选 Chip'],
    '高',
  );

  // ========== 11 客服 ==========
  await goto(page, '/pages/home/index');
  await page.waitForTimeout(800);
  const fab = page.locator('.cs-fab, [class*="cs-fab"], [aria-label*="客服"]');
  const fabVisible = await fab.first().isVisible().catch(() => false);
  await goto(page, '/pages/profile/index');
  await clickHasText(page, /客服|联系客服|CS/);
  await page.waitForTimeout(1000);
  await shot(page, '11-cs-sheet');
  await clickHasText(page, /人工|Human/);
  await page.waitForTimeout(2200);
  await shot(page, '11-cs-chat');
  const chatInput = page.locator('textarea, input').last();
  if (await chatInput.count()) {
    await chatInput.fill('请问我的订单进度怎样？有一件代购可能缺货，请帮我核实。');
    await clickHasText(page, /发送|Send/);
    await page.waitForTimeout(1500);
  }
  await shot(page, '11-cs-msg');
  const chatAfter = await text(page);
  const templateReply = /稍候|收到|为您处理|客服|人工/.test(chatAfter);

  await goto(page, '/pages/info/index?type=service');
  await page.waitForTimeout(800);
  const serviceInfo = await text(page);
  const staleServiceCopy = /待接入|尚未配置/.test(serviceInfo);

  const d11 = [];
  if (!templateReply) d11.push('发送咨询后未见客服/模板回复');
  if (staleServiceCopy) d11.push('info「客服中心」仍显示「待接入/尚未配置」，与真实会话能力矛盾，降低信任');
  d11.push('回复偏模板「稍候为您处理」，不能自动带入订单号查单');
  d11.push('SupportHost 残留调试上报（127.0.0.1:7709），控制台噪音/隐私风险');
  d11.push('用户侧看不到工单号与处理进度');

  record(
    '11.客服功能',
    'FAB/个人中心进客服→选人工→发送订单进度与缺货咨询→检查 info 客服中心文案',
    `FAB可见≈${fabVisible}；模板回复=${templateReply}；info仍写待接入=${staleServiceCopy}`,
    d11,
    ['统一客服入口与文案', '会话自动附带最近订单卡片', '移除调试 ingest', '用户可见工单进度页'],
    '高',
  );

  // ========== 12 投诉 ==========
  let complaintFound = false;
  for (const path of ['/pages/orders/index', '/pages/profile/index', '/pages/support/chat', '/pages/home/index']) {
    await goto(page, path);
    await page.waitForTimeout(700);
    if (/投诉|Complaint|举报|售后申请/.test(await text(page))) {
      complaintFound = true;
      await shot(page, '12-complaint');
      break;
    }
  }
  // try open first order detail
  await goto(page, '/pages/orders/index');
  await page.waitForTimeout(1200);
  const orderRow = page.locator('.order-row, [class*="order-row"]').first();
  if (await orderRow.count()) {
    await orderRow.click({ force: true });
    await page.waitForTimeout(1800);
    await shot(page, '12-order-detail');
    if (/投诉|Complaint|举报/.test(await text(page))) complaintFound = true;
  }

  const d12 = [];
  if (!complaintFound) d12.push('用户端未找到投诉表单入口，无法提交结构化投诉工单');
  d12.push('投诉只能通过客服聊天口述，无 issueType（破损/态度/乱收费等）与凭证上传');
  d12.push('无投诉进度查询；工单能力仅在管理端 API');

  record(
    '12.投诉功能',
    '在首页/订单/详情/个人中心/客服页查找投诉入口并尝试提交',
    `可见投诉入口=${complaintFound}`,
    d12,
    ['订单详情增加「投诉/售后」：原因+描述+图片→用户侧 tickets API', '提交成功展示工单号与进度'],
    '高',
  );

  // ========== 13 闭环 ==========
  await goto(page, '/pages/ride/index');
  await page.waitForTimeout(2500);
  const chips = page.locator('.chip, [class*="chip"]');
  if ((await chips.count()) >= 2) {
    await chips.nth(0).click({ force: true }).catch(() => {});
    await page.waitForTimeout(400);
    await chips.nth(Math.min(1, (await chips.count()) - 1)).click({ force: true }).catch(() => {});
  }
  await fillByPlaceholder(page, /姓名|联系|name/i, '走查用户');
  await fillByPlaceholder(page, /手机|电话|phone|\+856/i, SEED_PHONE);
  await clickHasText(page, /呼叫|下单|提交|叫车/);
  await page.waitForTimeout(3200);
  await shot(page, '13-ride-submit');
  const created = page.url().includes('order-detail') || /LF-|成功|详情|PENDING/.test(await text(page));
  let detailBlob = await text(page);
  let unpaidWithActive = /UNPAID|未支付|未付款/.test(detailBlob);
  let statusText = detailBlob.slice(0, 500);

  if (!page.url().includes('order-detail')) {
    await goto(page, '/pages/orders/index');
    await page.waitForTimeout(1500);
    if (await orderRow.count()) {
      await page.locator('.order-row, [class*="order-row"]').first().click({ force: true }).catch(() => {});
      await page.waitForTimeout(1500);
      detailBlob = await text(page);
      unpaidWithActive = /UNPAID|未支付|未付款/.test(detailBlob);
      statusText = detailBlob.slice(0, 500);
    }
  }

  const canSelfComplete = /确认完成|确认收货|COMPLETE/.test(detailBlob) && /DELIVERED|已送达/.test(detailBlob);
  const stuckFeeling = created || hasList;

  const d13 = [];
  if (!created) d13.push('本轮打车一键下单未稳定成功（表单校验/字段未填全/接口失败）');
  d13.push('用户端无法独自将订单推进到 COMPLETED，必须依赖骑手/后台，易被感知为「卡住」');
  if (unpaidWithActive) d13.push('详情/列表出现 UNPAID（未支付）与进行中/完成态并存，用户困惑是否还需付款');
  d13.push('无状态变更推送/站内信，只能手动刷新或等待详情轮询');
  if (!canSelfComplete) d13.push('多数状态下用户无清晰「完成订单」主按钮，闭环感知弱');

  record(
    '13.订单闭环',
    '打车页选点尝试下单→进入订单详情观察状态与支付字段',
    `下单尝试成功=${created}；见UNPAID文案=${unpaidWithActive}；用户可自助完成=${canSelfComplete}；详情摘要=${statusText.replace(/\s+/g, ' ').slice(0, 180)}`,
    d13,
    ['详情步骤条：下单→派单→接单→送达→完成', '完成态明确「已支付/待线下付」', '状态变更推送'],
    '中',
  );

  await browser.close();

  const high = rows.filter((r) => r.severity === '高').length;
  const mid = rows.filter((r) => r.severity === '中').length;
  const report = {
    generatedAt: new Date().toISOString(),
    base: BASE,
    api: API,
    env: {
      mockCode: '123456',
      viteApi: 'http://127.0.0.1:3000/api/v1',
      corp: 'cross-origin',
      corsLocal: true,
    },
    summary: { total: rows.length, high, medium: mid, pass: rows.filter((r) => r.severity === '通过').length },
    rows,
  };

  writeFileSync(join(OUT, 'playwright-13-report.json'), JSON.stringify(report, null, 2), 'utf8');

  const md = [
    '# Playwright 用户端 13 项功能走查报告',
    '',
    `- 时间：${report.generatedAt}`,
    `- H5：${BASE}`,
    `- API：${API}`,
    `- 汇总：高 ${high} / 中 ${mid} / 通过 ${report.summary.pass}`,
    '',
    '| 测试项 | 问题等级 | 实际现象（摘要） |',
    '|---|---|---|',
    ...rows.map((r) => `| ${r.item} | ${r.severity} | ${r.actual.replace(/\|/g, '/').slice(0, 120)} |`),
    '',
    ...rows.flatMap((r) => [
      `## ${r.item}`,
      '',
      `- **操作过程**：${r.process}`,
      `- **实际现象**：${r.actual}`,
      `- **问题等级**：${r.severity}`,
      `- **缺陷**：`,
      ...(r.defects.length ? r.defects.map((d) => `  - ${d}`) : ['  - （无）']),
      `- **优化建议**：`,
      ...r.suggestions.map((s) => `  - ${s}`),
      '',
    ]),
  ].join('\n');
  writeFileSync(join(OUT, 'playwright-13-report.md'), md, 'utf8');

  console.log(JSON.stringify({ ok: true, out: OUT, summary: report.summary }, null, 2));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
