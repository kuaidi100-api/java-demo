import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return;
  for (const rawLine of readFileSync(envPath, 'utf8').split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    if (process.env[key] === undefined) process.env[key] = line.slice(separator + 1).trim();
  }
}

loadLocalEnv();

const chromeCandidates = [
  process.env.BROWSER_EXECUTABLE_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);
const executablePath = chromeCandidates.find((candidate) => existsSync(candidate));
if (!executablePath) throw new Error('未找到可用于浏览器回归测试的 Chrome 或 Edge。');

const artifactDir = resolve(process.cwd(), '.runtime', 'browser-login-diagnostics');
mkdirSync(artifactDir, { recursive: true });

const clients = [
  {
    name: 'user-app',
    url: 'http://127.0.0.1:5173/#/pages/login/index',
    identifier: process.env.SEED_USER_PHONE,
    password: process.env.SEED_USER_PASSWORD,
    identifierPlaceholder: '国际格式手机号',
    passwordPlaceholder: '请输入密码',
    submitText: '进入木棉速达',
    authenticatedUrl: /#\/pages\/home\/index/u,
    viewport: { width: 430, height: 932 },
  },
  {
    name: 'courier-app',
    url: 'http://127.0.0.1:5174/#/pages/login/index',
    identifier: process.env.SEED_COURIER_PHONE,
    password: process.env.SEED_COURIER_PASSWORD,
    identifierPlaceholder: '国际格式手机号',
    passwordPlaceholder: '请输入密码',
    submitText: '进入工作台',
    authenticatedUrl: /#\/pages\/workbench\/index/u,
    viewport: { width: 430, height: 932 },
  },
  {
    name: 'admin-web',
    url: 'http://127.0.0.1:5175/#/login',
    identifier: process.env.SEED_ADMIN_USERNAME,
    password: process.env.SEED_ADMIN_PASSWORD,
    identifierPlaceholder: '请输入管理员用户名',
    passwordPlaceholder: '请输入密码',
    submitText: '进入运营中心',
    authenticatedUrl: /#\/overview/u,
    viewport: { width: 1440, height: 900 },
  },
];

for (const client of clients) {
  if (!client.identifier || !client.password) {
    throw new Error(`${client.name} 缺少本地演示账号环境变量。`);
  }
}

const browser = await chromium.launch({ executablePath, headless: true });
const results = [];

try {
  for (const client of clients) {
    const context = await browser.newContext({ viewport: client.viewport });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    const requests = new Map();
    const consoleMessages = [];
    const pageErrors = [];

    await cdp.send('Network.enable');
    cdp.on('Network.requestWillBeSent', ({ requestId, request }) => {
      if (request.url.includes('/auth/login')) {
        requests.set(requestId, {
          requestUrl: request.url,
          requestMethod: request.method,
          statusCode: null,
          responseHeaders: null,
          failure: null,
        });
      }
    });
    cdp.on('Network.responseReceived', ({ requestId, response }) => {
      const request = requests.get(requestId);
      if (!request) return;
      request.statusCode = response.status;
      request.responseHeaders = response.headers;
    });
    cdp.on('Network.loadingFailed', ({ requestId, errorText, corsErrorStatus }) => {
      const request = requests.get(requestId);
      if (!request) return;
      request.failure = { errorText, corsErrorStatus: corsErrorStatus ?? null };
    });
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') {
        consoleMessages.push({ type: message.type(), text: message.text() });
      }
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(client.url, { waitUntil: 'networkidle', timeout: 20_000 });
    const usernameInput = page.locator('input').nth(0);
    try {
      await usernameInput.waitFor({ state: 'visible', timeout: 8_000 });
    } catch {
      const screenshot = resolve(artifactDir, `${client.name}-login-unavailable.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      results.push({
        client: client.name,
        pageOrigin: new URL(client.url).origin,
        network: [...requests.values()],
        consoleMessages,
        pageErrors,
        afterLoginUrl: page.url(),
        authenticatedAfterLogin: false,
        afterRefreshUrl: page.url(),
        authenticatedAfterRefresh: false,
        screenshot,
        pageText: (await page.locator('body').innerText()).slice(0, 500),
      });
      await context.close();
      continue;
    }
    await usernameInput.fill(client.identifier);
    await page.locator('input').nth(1).fill(client.password);
    await page.getByText(client.submitText, { exact: true }).click();
    await page.waitForTimeout(2_000);

    const afterLoginUrl = page.url();
    const authenticatedAfterLogin = client.authenticatedUrl.test(afterLoginUrl);
    await page.screenshot({ path: resolve(artifactDir, `${client.name}-logged-in.png`), fullPage: true });

    await page.reload({ waitUntil: 'networkidle', timeout: 20_000 });
    await page.waitForTimeout(700);
    const afterRefreshUrl = page.url();
    const authenticatedAfterRefresh = client.authenticatedUrl.test(afterRefreshUrl);

    results.push({
      client: client.name,
      pageOrigin: new URL(client.url).origin,
      network: [...requests.values()],
      consoleMessages,
      pageErrors,
      afterLoginUrl,
      authenticatedAfterLogin,
      afterRefreshUrl,
      authenticatedAfterRefresh,
      screenshot: resolve(artifactDir, `${client.name}-logged-in.png`),
    });
    await context.close();
  }
} finally {
  await browser.close();
}

const resultPath = resolve(artifactDir, 'network-results.json');
writeFileSync(resultPath, `${JSON.stringify(results, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ resultPath, results }, null, 2));

if (results.some((result) => !result.authenticatedAfterLogin || !result.authenticatedAfterRefresh)) {
  process.exitCode = 1;
}
