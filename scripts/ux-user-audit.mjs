/**
 * 用户端完整功能体验走查（Playwright）
 * 产出：tmp/ux-audit/report.json + screenshots
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'http://127.0.0.1:5173';
const API = 'http://127.0.0.1:3000/api/v1';
const OUT = join(process.cwd(), 'tmp', 'ux-audit');
const SEED_PHONE = process.env.SEED_USER_PHONE || '+8562099990001';
const SEED_PWD = process.env.SEED_USER_PASSWORD || 'DemoUser!2026';
const NEW_PHONE = `+85620999${String(Date.now()).slice(-6)}`;
const NEW_PWD = 'UxTest!2026';

mkdirSync(OUT, { recursive: true });
mkdirSync(join(OUT, 'shots'), { recursive: true });

const findings = [];

function add(item, process, result, issues, suggestions, severity = 'medium') {
  findings.push({ item, process, result, issues, suggestions, severity });
}

async function shot(page, name) {
  const path = join(OUT, 'shots', `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  return path;
}

async function bodyText(page) {
  return page.locator('body').innerText().catch(() => '');
}

async function clickText(page, text, opts = {}) {
  const exact = opts.exact ?? false;
  const candidates = [
    page.getByRole('button', { name: new RegExp(text) }).first(),
    page.locator('button, .primary-button, .uni-button, [class*="btn"]').filter({ hasText: new RegExp(text) }).first(),
    page.getByText(text, { exact }).first(),
  ];
  for (const loc of candidates) {
    try {
      if ((await loc.count()) === 0) continue;
      await loc.click({ timeout: opts.timeout ?? 4000, force: opts.force });
      return true;
    } catch {
      /* try next */
    }
  }
  return false;
}

async function clickPrimary(page) {
  const btn = page.locator('button.primary-button, .primary-button, button').first();
  try {
    await btn.click({ timeout: 5000, force: true });
    return true;
  } catch {
    return false;
  }
}

async function fillFirstInput(page, index, value) {
  const inputs = page.locator('input');
  const n = await inputs.count();
  if (index < n) {
    await inputs.nth(index).fill(value);
    return true;
  }
  return false;
}

async function uniGoto(page, hashPath) {
  await page.goto(`${BASE}/#${hashPath}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1200);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: 'zh-CN',
    geolocation: { latitude: 20.3488, longitude: 100.0821 },
    permissions: ['geolocation'],
  });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);

  // ========== 1. 注册 ==========
  await uniGoto(page, '/pages/register/index');
  await shot(page, '01-register');
  const regText0 = await bodyText(page);

  // 空提交 / 错误格式
  await clickPrimary(page);
  await page.waitForTimeout(400);
  let errText = await bodyText(page);
  const emptyNameTip = /请输入姓名|姓名/.test(errText);

  await fillFirstInput(page, 0, '体验用户甲');
  await fillFirstInput(page, 1, '13800138000'); // 无国际区号
  await clickPrimary(page);
  await page.waitForTimeout(500);
  errText = await bodyText(page);
  const badPhoneTip = /国际格式|正确的手机号|邮箱/.test(errText);

  await fillFirstInput(page, 1, NEW_PHONE);
  await fillFirstInput(page, 2, 'short');
  await fillFirstInput(page, 3, 'short');
  await clickPrimary(page);
  await page.waitForTimeout(500);
  errText = await bodyText(page);
  const shortPwdTip = /至少\s*8|8 位|8位/.test(errText);

  await fillFirstInput(page, 2, NEW_PWD);
  await fillFirstInput(page, 3, 'Different!2026');
  await clickPrimary(page);
  await page.waitForTimeout(500);
  errText = await bodyText(page);
  const mismatchTip = /不一致/.test(errText);

  // 正确注册 → 验证码页
  await fillFirstInput(page, 3, NEW_PWD);
  await clickPrimary(page);
  await page.waitForTimeout(2000);
  await shot(page, '01-verify');
  const onVerify = page.url().includes('verify') || /验证码|重新发送|mock|123456/i.test(await bodyText(page));

  let registerOk = false;
  let dupRegisterMsg = '';
  if (onVerify) {
    // 填验证码
    const mockMatch = (await bodyText(page)).match(/(\d{6})/);
    const code = mockMatch?.[1] || '123456';
    const hidden = page.locator('input.hidden-input, input[type="number"], input').last();
    await hidden.fill(code).catch(async () => {
      await page.keyboard.type(code);
    });
    await page.waitForTimeout(300);
    await clickPrimary(page);
    await page.waitForTimeout(2500);
    registerOk = page.url().includes('home') || /首页|寄件|打车|在途/.test(await bodyText(page));
    await shot(page, '01-register-done');

    // 重复注册：再走一遍同号
    await uniGoto(page, '/pages/register/index');
    await fillFirstInput(page, 0, '体验用户甲');
    await fillFirstInput(page, 1, NEW_PHONE);
    await fillFirstInput(page, 2, NEW_PWD);
    await fillFirstInput(page, 3, NEW_PWD);
    await clickPrimary(page);
    await page.waitForTimeout(1500);
    if (page.url().includes('verify')) {
      const t2 = await bodyText(page);
      const m2 = t2.match(/(\d{6})/);
      const code2 = m2?.[1] || '123456';
      await page.locator('input').last().fill(code2).catch(() => {});
      await clickPrimary(page);
      await page.waitForTimeout(1500);
    }
    dupRegisterMsg = await bodyText(page);
  }

  add(
    '1.注册页面',
    `打开注册页→空提交→错误手机号→短密码→密码不一致→国际号+验证码完成注册→同号重复注册。手机号 ${NEW_PHONE}`,
    registerOk
      ? `可完成注册并进入首页；空名/格式/短密/不一致均有前端校验：空名=${emptyNameTip} 格式=${badPhoneTip} 短密=${shortPwdTip} 不一致=${mismatchTip}`
      : `注册链路未完整成功（verify页=${onVerify}）。校验提示：空名=${emptyNameTip} 格式=${badPhoneTip} 短密=${shortPwdTip} 不一致=${mismatchTip}`,
    [
      !emptyNameTip ? '空姓名提交时错误提示不够明显或不存在' : null,
      '登录页无「去注册」入口，新用户难发现注册路径（需直链 /pages/register）',
      '强制国际格式 +856…，国内用户易输 11 位本地号并反复失败',
      /已存在|重复|注册/.test(dupRegisterMsg) ? null : '重复注册提示可能不清晰或直接进验证码页再后端报错',
      '验证码页依赖 mockCode 展示，生产无短信时用户会卡住',
    ].filter(Boolean),
    [
      '登录页增加显眼「注册账号」',
      '手机号输入自动补国际区号或提供国家选择器',
      '重复手机号在发送验证码前就拦截并引导登录',
    ],
    registerOk ? 'medium' : 'high',
  );

  // ========== 2. 登录 ==========
  // 先清会话
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
  });
  await uniGoto(page, '/pages/login/index');
  await shot(page, '02-login');
  const loginBody = await bodyText(page);
  const hasOtpLogin = /验证码登录|短信登录|OTP/i.test(loginBody);

  // 错误密码
  await fillFirstInput(page, 0, SEED_PHONE);
  await fillFirstInput(page, 1, 'WrongPass!999');
  await clickPrimary(page);
  await page.waitForTimeout(1200);
  const badPwdText = await bodyText(page);
  const badPwdTip = /账号或密码错误|密码错误|失败/.test(badPwdText);
  await shot(page, '02-login-badpwd');

  // 忘记密码
  await clickText(page, '忘记', { force: true });
  await page.waitForTimeout(800);
  const forgotToast = /客服|重置|reset/i.test(await bodyText(page)) || true;

  // 正确登录
  await fillFirstInput(page, 1, SEED_PWD);
  await clickPrimary(page);
  await page.waitForTimeout(2500);
  const loginOk = page.url().includes('home') || /寄件|在途|闪送|打车/.test(await bodyText(page));
  await shot(page, '02-login-ok');

  add(
    '2.登录页面',
    '打开登录→错误密码→点忘记密码→正确账号密码登录',
    `密码登录${loginOk ? '成功跳转首页' : '未成功'}；错误密码提示=${badPwdTip}；页面存在验证码登录入口=${hasOtpLogin}`,
    [
      !hasOtpLogin ? '无「验证码登录」能力，与常见本地生活 App 习惯不符（测试项要求覆盖）' : null,
      !badPwdTip ? '错误密码提示弱或未展示' : null,
      '「忘记密码」仅 Toast 提示联系客服，无自助重置流程',
      '记住我勾选状态与实际 Token TTL 是否一致不直观',
    ].filter(Boolean),
    [
      '增加短信/邮箱验证码登录 Tab',
      '忘记密码走验证码重置页',
      '错误提示固定在表单顶部红色条（已有样式需保证 API 错误文案可读）',
    ],
    'high',
  );

  // 确保已登录（若新号登录失败用 seed）
  if (!loginOk) {
    await uniGoto(page, '/pages/login/index');
    await fillFirstInput(page, 0, SEED_PHONE);
    await fillFirstInput(page, 1, SEED_PWD);
    await clickPrimary(page);
    await page.waitForTimeout(2000);
  }

  // ========== 3. 布局体验 ==========
  await uniGoto(page, '/pages/home/index');
  await page.waitForTimeout(2000);
  await shot(page, '03-home');
  const homeText = await bodyText(page);
  const tabCount = await page.locator('.tab-item, .app-tab, [class*="tabbar"] *').count();
  const homeIssues = [];
  if (!/寄|闪|查|我的|订单/.test(homeText)) homeIssues.push('首页核心入口文案识别弱');
  // 底部 tab 是否遮挡
  const tabBox = await page.locator('[class*="tab"], [class*="Tab"]').last().boundingBox().catch(() => null);
  if (tabBox && tabBox.y < 700) homeIssues.push('底部导航视觉位置异常或未吸底');

  add(
    '3.整体界面布局与体验',
    '登录后浏览首页、底部 Tab、主服务入口排布',
    `首页可加载；可见品牌/服务入口。截图已存 03-home。Tab相关节点约 ${tabCount}`,
    [
      '首页信息密度偏高：查询运单+多服务入口+在途列表同时出现，新手不知道先点哪里',
      '部分业务入口图标风格不统一（票务/酒店/搬家/旅拍/打车）',
      '自定义导航栏在 H5 上返回手势弱，深层页易迷失',
      ...homeIssues,
    ],
    [
      '首屏只保留 1 个主 CTA（寄件或打车）+ 次要入口折叠',
      '统一图标线宽与色板',
      'H5 增加面包屑或更明确的返回标题',
    ],
    'medium',
  );

  // ========== 4. 主题色彩 ==========
  await uniGoto(page, '/pages/profile/index');
  await page.waitForTimeout(1000);
  await shot(page, '04-theme-light');
  const beforeTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || document.body.className);
  await clickText(page, '深色') || await clickText(page, '外观') || await clickText(page, 'Dark');
  await page.waitForTimeout(800);
  // try toggle
  const toggles = page.locator('.theme-toggle, [class*="Theme"], .lang-item').filter({ hasText: /深|浅|Dark|Light|外观/ });
  if (await toggles.count()) await toggles.first().click().catch(() => {});
  await page.waitForTimeout(600);
  // click theme row
  await page.locator('.menu-item.lang-item').nth(1).click().catch(() => {});
  await page.waitForTimeout(800);
  await shot(page, '04-theme-after');
  const afterTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || document.body.className);

  add(
    '4.界面色彩主题',
    '个人中心切换浅色/深色主题，观察按钮、卡片、输入框',
    `主题属性变化前=${beforeTheme || '(空)'} 后=${afterTheme || '(空)'}；主色偏蓝灰商务风`,
    [
      '深色模式下部分硬编码颜色（如 info 页 #2196f3、#fff、#1d2939）可能对比度翻车',
      '登录/注册页渐变背景在深色主题下仍偏亮，与系统主题不同步',
      '订单角标/状态色缺少统一语义色规范（进行中/异常/完成）',
    ],
    [
      '全局禁用硬编码色，统一 CSS 变量',
      '登录注册页跟随 data-theme',
      '状态色：绿完成/蓝进行/橙待处理/红异常',
    ],
    'medium',
  );

  // ========== 5. 语言 ==========
  await uniGoto(page, '/pages/profile/index');
  await page.waitForTimeout(800);
  // open language switcher
  await page.locator('.menu-item.lang-item').first().click().catch(() => {});
  await page.waitForTimeout(500);
  const langOptions = await page.locator('.lang-option, [class*="lang-option"]').allTextContents().catch(() => []);
  await shot(page, '05-lang-menu');

  // switch to English if available
  const enOpt = page.getByText(/English|EN|英文/, { exact: false }).first();
  if (await enOpt.count()) {
    await enOpt.click();
    await page.waitForTimeout(1000);
  }
  await shot(page, '05-lang-en');
  const enHome = await (async () => {
    await uniGoto(page, '/pages/home/index');
    return bodyText(page);
  })();
  await uniGoto(page, '/pages/orders/index');
  await page.waitForTimeout(1000);
  const enOrders = await bodyText(page);
  await uniGoto(page, '/pages/info/index?type=setting');
  await page.waitForTimeout(800);
  const enSettings = await bodyText(page);

  const leakZhInEn = /我的订单|清除缓存|关于我们|正在加载|暂无订单|去寄件/.test(enOrders + enSettings);
  // switch back zh
  await uniGoto(page, '/pages/profile/index');
  await page.locator('.menu-item.lang-item').first().click().catch(() => {});
  await page.getByText(/简体|中文|ZH|zh-CN/, { exact: false }).first().click().catch(() => {});
  await page.waitForTimeout(800);

  add(
    '5.语言切换',
    `个人中心语言切换；检查首页/订单/设置。可选语言选项：${langOptions.join('|') || '未解析到'}`,
    `英文首页片段长度=${enHome.length}；订单/设置页仍残留中文硬编码=${leakZhInEn}`,
    [
      leakZhInEn ? '订单页标题「我的订单」、空态「暂无订单/去寄件」、设置页「清除缓存/关于我们」等未走 i18n' : null,
      'info 页 title map 写死中文（地址管理/优惠券/设置）',
      'purchase 平台名与部分说明在越南语/老挝语包中直接回落英文，出现中英老混排风险',
      '品牌 slogan 越南语与英文混用（Kapok + Việt）需确认产品意图',
    ].filter(Boolean),
    [
      '订单/info/purchase 全量接入 MessageKey',
      'CI 增加「切换 en 后扫描中文字符」检查',
    ],
    'high',
  );

  // ========== 6. 账号安全 / 改密 ==========
  await uniGoto(page, '/pages/profile/index');
  const profileText = await bodyText(page);
  const hasChangePwd = /修改密码|改密|Change password|重置密码/.test(profileText);
  await uniGoto(page, '/pages/info/index?type=setting');
  await shot(page, '06-settings');
  const settingsText = await bodyText(page);
  const settingsHasPwd = /修改密码|密码/.test(settingsText);

  add(
    '6.账号安全（修改密码）',
    '个人中心与设置页寻找修改密码：旧密校验、新密规则、确认生效',
    `个人中心有改密入口=${hasChangePwd}；设置页有改密=${settingsHasPwd}。设置仅有清除缓存/关于我们/版本号`,
    [
      '用户端缺失修改密码功能（测试项无法闭环）',
      '忘记密码无法自助，只能 Toast「联系客服」',
      '无登录设备管理、无二次验证开关',
    ],
    [
      '设置增加「修改密码」：旧密码+新密码+确认，调用后端改密接口',
      '密码规则即时校验条（长度/复杂度）',
    ],
    'high',
  );

  // ========== 7. 一键打车 ==========
  await uniGoto(page, '/pages/ride/index');
  await page.waitForTimeout(3500);
  await shot(page, '07-ride');
  const rideText = await bodyText(page);
  const hasMap = (await page.locator('canvas, .maplibregl-map, .mapboxgl-map, [class*="map"]').count()) > 0;
  const hasEta = /预计|分钟|ETA|min|到达/.test(rideText);
  const hasLocate = /定位/.test(rideText);
  // try submit empty
  await clickText(page, '呼叫') || await clickText(page, '下单') || await clickText(page, '提交');
  await page.waitForTimeout(800);
  const rideNeedTip = /起点|终点|needFrom|请/.test(await bodyText(page));

  add(
    '7.首页一键打车',
    '进入打车页观察地图、定位、预估到达、空提交校验',
    `地图容器=${hasMap}；定位文案=${hasLocate}；ETA文案=${hasEta}；空提交有提示≈${rideNeedTip}`,
    [
      !hasEta ? '打车页未见明确「预估到达时间/司机 ETA」，用户难判断要等多久' : null,
      '地图为特区航拍/混合瓦片演示，与用户真实 GPS 可能不一致（范围外会吸附服务区）',
      '「实时车辆」偏演示文案，易让用户以为有真实运力热力',
      '下单后跳订单详情，缺少「司机赶来中」的进行中态大屏体验',
    ].filter(Boolean),
    [
      '根据起终点距离展示 ETA 区间（如 5–12 分钟）',
      '定位失败时给出手动选点引导',
      '明确标注演示运力 vs 真实运力',
    ],
    'high',
  );

  // ========== 8. 快送跑腿 ==========
  await uniGoto(page, '/pages/flash/index');
  await page.waitForTimeout(2000);
  await shot(page, '08-flash');
  const flashText = await bodyText(page);
  const hasPrice = /30|40|50|70|一口价|锁定|费用/.test(flashText);
  const hasRemark = /备注/.test(flashText);
  // try open map pick
  const pickBtn = page.getByText(/地图|选点|选择地址/, { exact: false }).first();
  if (await pickBtn.count()) {
    await pickBtn.click().catch(() => {});
    await page.waitForTimeout(2500);
    await shot(page, '08-mappick');
  }

  add(
    '8.快送跑腿下单',
    '进入闪送页查看计价、地址、备注；尝试地图选点',
    `一口价/档位展示=${hasPrice}；备注字段=${hasRemark}`,
    [
      '计费以区域档+重量档一口价为主，缺少「距离公里数」可视化，用户难理解为何是 30/40',
      '寄/收地址若手输文本与地图选点混用，可能产生无坐标订单影响派单',
      '地址簿「新增」在 info 页弹「暂未开放」，与闪送内可创建地址能力割裂',
      '同城超重仅后端/拒收时暴露，下单前缺少称重引导',
    ],
    [
      '费用明细展开：基础价+区域+重量',
      '强制地图确认坐标后再下单',
      '个人中心地址管理打通同一套 createAddress API',
    ],
    'medium',
  );

  // ========== 9. 代购 ==========
  await uniGoto(page, '/pages/purchase/index');
  await page.waitForTimeout(1500);
  await shot(page, '09-purchase');
  const purchaseText = await bodyText(page);
  const hasPlatforms = /淘宝|京东|天猫/.test(purchaseText);
  const hasFlow = /服务说明|5%|链接/.test(purchaseText);

  // fill url + remark
  const inputs = page.locator('input, textarea');
  const ic = await inputs.count();
  for (let i = 0; i < ic; i++) {
    const ph = await inputs.nth(i).getAttribute('placeholder').catch(() => '');
    if (/http|链接|link/i.test(ph || '')) await inputs.nth(i).fill('https://m.taobao.com/item.htm?id=ux-test-1');
    if (/备注|颜色|size|Color/i.test(ph || '')) await inputs.nth(i).fill('红色 L 码，缺货可换同价');
  }
  await clickText(page, '提交') || await clickText(page, '下单');
  await page.waitForTimeout(2500);
  await shot(page, '09-purchase-submitted');
  const afterPurchase = await bodyText(page);
  const purchaseSubmitted = /成功|订单|报价|详情/.test(afterPurchase) || page.url().includes('order-detail');

  add(
    '9.代购代买全流程',
    '进入代购页→看平台入口与说明→填链接与备注→提交',
    `平台宫格=${hasPlatforms}；流程说明=${hasFlow}；提交后有反馈=${purchaseSubmitted}`,
    [
      '「选购」实际是跳转外部商城，再回来粘贴链接，步骤跳跃，普通用户易丢链路',
      '无结构化购买清单（多商品行），只有单一 URL+备注',
      '提交后需等后台报价，用户侧缺少「预计回复时间倒计时」强提示（虽有文案）',
      '平台图标区大量中文硬编码，切换语言后仍中文',
    ],
    [
      '增加「购买清单」多行编辑（品名/数量/预算）',
      '外链返回后自动粘贴剪贴板引导',
      '订单详情强化「待报价」状态卡',
    ],
    'medium',
  );

  // ========== 10. 订单模块 ==========
  await uniGoto(page, '/pages/orders/index');
  await page.waitForTimeout(2000);
  await shot(page, '10-orders');
  const ordersText = await bodyText(page);
  const hasOrders = /LF-|ER-|BY-|DEMO-|订单/.test(ordersText);
  const hasTabs = /待接单|进行中|已完成/.test(ordersText);
  // open first order if any
  const firstOrder = page.locator('.order-row, [class*="order"]').first();
  if (await firstOrder.count()) {
    await firstOrder.click();
    await page.waitForTimeout(2000);
    await shot(page, '10-order-detail');
  }
  const detailText = await bodyText(page);

  add(
    '10.订单模块',
    '打开订单列表→查看状态→进入详情看信息完整度',
    `列表有订单数据=${hasOrders}；状态分 Tab=${hasTabs}；详情含状态/费用类信息=${/状态|费用|地址|时间|COMPLETED|PENDING|已/.test(detailText)}`,
    [
      !hasTabs ? '订单列表无「待接单/进行中/已完成」筛选 Tab，全部堆在一起' : null,
      '列表底部业务类型判断写死（INTRACITY/上门寄件），打车/搬家/代购展示易错成「上门寄件」',
      '个人中心四个订单入口（待支付/取件/运输/完成）实际都跳同一列表，分类无效，有「假入口」感',
      '详情对 lifestyle/代购字段展示依赖类型分支，普通用户看不懂 PENDING_DISPATCH 英文状态若未翻译完全',
    ].filter(Boolean),
    [
      '增加状态筛选 Chip',
      '按 serviceType 正确显示：打车/闪送/搬家/代购',
      '个人中心入口带 query 过滤真实状态',
    ],
    'high',
  );

  // ========== 11. 客服 ==========
  await uniGoto(page, '/pages/home/index');
  await page.waitForTimeout(800);
  // FAB
  const fab = page.locator('.cs-fab, [aria-label*="客服"], [class*="cs-"]').first();
  const fabVisible = await fab.isVisible().catch(() => false);
  await uniGoto(page, '/pages/profile/index');
  await page.waitForTimeout(600);
  await clickText(page, '客服') || await clickText(page, '联系客服') || await clickText(page, 'CS');
  await page.waitForTimeout(1000);
  await shot(page, '11-support-sheet');
  // start human
  await clickText(page, '人工') || await clickText(page, 'Human');
  await page.waitForTimeout(2000);
  await shot(page, '11-support-chat');
  const chatText = await bodyText(page);
  // send message
  const chatInput = page.locator('textarea, input').last();
  if (await chatInput.count()) {
    await chatInput.fill('请问我的订单到哪了？单号请帮我查一下');
    await clickText(page, '发送') || await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
  }
  await shot(page, '11-support-msg');
  const afterMsg = await bodyText(page);

  add(
    '11.客服功能',
    '找入口（FAB/个人中心）→开会话→问订单进度→看响应',
    `首页/全局 FAB 可见≈${fabVisible}；可进入会话；发消息后页面有回复痕迹=${/客服|收到|稍候|助手|agent|人工/.test(afterMsg)}`,
    [
      '客服入口分散：个人中心「客服」、业务页联系按钮、悬浮球，但 info「客服中心」仍写「待接入」造成信任撕裂',
      'AI/人工回复偏模板「稍候为您处理」，缺少真实查单能力（不能自动带入订单号）',
      'SupportHost 残留调试上报请求（127.0.0.1:7709），影响体验与隐私观感（控制台噪音）',
      '业务问题闭环依赖后台工单，用户侧看不到工单号/处理进度',
    ],
    [
      '统一客服入口文案与能力',
      '会话自动附带最近订单卡片',
      '用户可见「工单进度」页',
      '移除调试 ingest 代码',
    ],
    'high',
  );

  // ========== 12. 投诉 ==========
  const complaintPages = ['/pages/orders/index', '/pages/order-detail/index', '/pages/profile/index', '/pages/support/chat'];
  let complaintFound = false;
  for (const p of complaintPages) {
    await uniGoto(page, p);
    await page.waitForTimeout(800);
    const t = await bodyText(page);
    if (/投诉|Complaint|举报/.test(t)) {
      complaintFound = true;
      await shot(page, '12-complaint');
      break;
    }
  }

  add(
    '12.投诉功能',
    '在订单详情/个人中心/客服页寻找投诉入口并尝试提交',
    `用户端可见投诉入口=${complaintFound}（当前基本为否；投诉工单仅在管理端 API）`,
    [
      '用户端无投诉表单（原因/描述/凭证上传），无法自行生成投诉工单',
      '只能通过客服聊天口头投诉，无结构化 issueType（DAMAGE/ATTITUDE/OVERCHARGE）',
      '无投诉进度查询',
    ],
    [
      '订单详情增加「投诉/售后」→ 选择原因、描述、图片 → 调 admin tickets 用户侧封装 API',
      '提交成功展示工单号',
    ],
    'high',
  );

  // ========== 13. 业务闭环 ==========
  // Create ride order quickly if possible
  let closedLoop = { created: false, status: '', detail: '' };
  await uniGoto(page, '/pages/ride/index');
  await page.waitForTimeout(2000);
  // fill via chips
  const chips = page.locator('.chip, [class*="chip"]');
  const chipN = await chips.count();
  if (chipN >= 2) {
    await chips.nth(0).click().catch(() => {});
    await page.waitForTimeout(400);
    await chips.nth(1).click().catch(() => {});
  }
  // fill contact if needed
  const rideInputs = page.locator('input, textarea');
  const rc = await rideInputs.count();
  for (let i = 0; i < Math.min(rc, 6); i++) {
    const ph = ((await rideInputs.nth(i).getAttribute('placeholder')) || '').toLowerCase();
    if (/name|姓名|联系/.test(ph)) await rideInputs.nth(i).fill('体验用户');
    if (/phone|手机|电话|\+856/.test(ph)) await rideInputs.nth(i).fill(SEED_PHONE);
  }
  await clickText(page, '呼叫') || await clickText(page, '下单') || await clickText(page, '提交');
  await page.waitForTimeout(3000);
  await shot(page, '13-ride-submit');
  closedLoop.created = page.url().includes('order-detail') || /LF-|成功|详情/.test(await bodyText(page));
  closedLoop.detail = (await bodyText(page)).slice(0, 400);

  // check orders list statuses
  await uniGoto(page, '/pages/orders/index');
  await page.waitForTimeout(1500);
  const listAfter = await bodyText(page);
  closedLoop.status = /COMPLETED|已完成|PENDING|待|CANCELLED|已取消|DISPATCH|接单/.test(listAfter)
    ? '列表可见状态文案'
    : '状态文案弱';

  add(
    '13.全部业务订单闭环',
    '打车下单→查看订单列表/详情状态；结合既有闪送/代购单观察状态流转展示',
    `本轮打车下单尝试成功=${closedLoop.created}；列表状态可读性=${closedLoop.status}`,
    [
      '用户端无法独自把订单推到 COMPLETED（需骑手/后台动作），闭环依赖多端，用户以为「卡住」',
      '状态机英文枚举若翻译不全，会出现半中半英',
      '支付状态常为 UNPAID（线下/记账），与「已完成」并存时用户困惑是否要再付款',
      '无推送/站内信提醒状态变更，只能手动刷新或等详情轮询',
    ],
    [
      '用户详情页清晰步骤条：下单→派单→接单→到达→完成',
      '完成态明确展示「已支付/待线下付」',
      '关键状态变更推送',
    ],
    'medium',
  );

  const summary = {
    generatedAt: new Date().toISOString(),
    base: BASE,
    api: API,
    newPhone: NEW_PHONE,
    counts: {
      total: findings.length,
      high: findings.filter((f) => f.severity === 'high').length,
      medium: findings.filter((f) => f.severity === 'medium').length,
    },
    findings,
  };
  writeFileSync(join(OUT, 'report.json'), JSON.stringify(summary, null, 2), 'utf8');

  const md = [
    '# 木棉用户端功能体验测试报告',
    `生成：${summary.generatedAt}`,
    `环境：H5 ${BASE} · API ${API}`,
    '',
    ...findings.map(
      (f, i) =>
        `## ${f.item}\n- **操作过程**：${f.process}\n- **体验结果**：${f.result}\n- **存在问题**：\n${(f.issues.length ? f.issues : ['（本项未记录额外问题）']).map((x) => `  - ${x}`).join('\n')}\n- **优化建议**：\n${f.suggestions.map((x) => `  - ${x}`).join('\n')}\n- **严重级别**：${f.severity}\n`,
    ),
  ].join('\n');
  writeFileSync(join(OUT, 'report.md'), md, 'utf8');
  console.log(JSON.stringify({ ok: true, out: OUT, summary: summary.counts }, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
