# 木棉速达 · 快递综合服务平台部署方案

## 一、项目架构

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  用户端 H5  │  │ 配送员端 H5 │  │ 管理后台 Web │
│  (uni-app)  │  │  (uni-app)  │  │   (Vue 3)   │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────────────┼────────────────┘
                        │ HTTPS/JSON
                        ▼
              ┌───────────────────┐
              │   NestJS API      │  :3000
              │  (Prisma ORM)     │
              └─────────┬─────────┘
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
   ┌─────────────┐             ┌─────────────┐
   │  MySQL 8.4  │             │  Redis 7.4  │
   │  :3306      │             │  :6379      │
   └─────────────┘             └─────────────┘
```

### 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| API 后端 | 3000 | NestJS + Swagger (/docs) |
| 用户端 | 5173 | uni-app H5 |
| 配送员端 | 5174 | uni-app H5 |
| 管理后台 | 5175 | Vue 3 SPA |
| MySQL | 3306 | 关系数据库 |
| Redis | 6379 | 缓存/会话 |

## 二、技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Node.js 20+ / NestJS 10 / Prisma 6 |
| 数据库 | MySQL 8.4 / Redis 7.4 |
| 用户端 | uni-app + Vue 3 + TypeScript |
| 配送员端 | uni-app + Vue 3 + TypeScript |
| 管理后台 | Vue 3 + Vue Router + TypeScript |
| 共享包 | shared-types / api-client / ui-components |
| 认证 | JWT (Access + Refresh) + RBAC |
| 物流 | 快递100 Java SDK (适配层，mock 模式可独立运行) |

## 三、本地开发环境

### 3.1 前置要求

- Node.js ≥ 20，npm ≥ 10
- Docker Desktop（用于 MySQL / Redis）
- 内存 ≥ 4GB，磁盘 ≥ 5GB

### 3.2 一键启动

```powershell
# 进入项目根目录
cd F:\100fen\DK100\java-demo

# 首次启动（自动创建 .env、启动容器、迁移、种子、构建、启动 API）
.\scripts\start-local.cmd

# 另开终端，启动三个前端预览
.\scripts\start-previews.cmd
```

### 3.3 分步启动

```powershell
# 1. 复制环境变量
Copy-Item .env.example .env

# 2. 启动数据库
docker compose up -d mysql redis

# 3. 安装依赖 & 生成 Prisma Client
npm install
npm run db:generate

# 4. 数据库迁移 + 种子数据
npm run db:migrate
npm run db:seed

# 5. 启动 API（开发模式，热重载）
npm run start:api

# 6. 启动前端（另开终端）
npm run start:user     # 用户端 :5173
npm run start:courier  # 配送员端 :5174
npm run start:admin    # 管理后台 :5175
```

### 3.4 演示账号

| 角色 | 账号 | 密码 |
|------|------|------|
| 管理员 | admin | DemoAdmin!2026 |
| 用户 | +8562099990001 | DemoUser!2026 |
| 配送员 | +8562099990002 | DemoCourier!2026 |

> 开发环境默认 `PROVIDER_MODE=mock`，所有物流、短信、地图、支付均为模拟，不会产生真实费用。

## 四、生产部署方案（推荐：Docker Compose 全容器化）

### 4.1 服务器要求

| 配置 | 最低 | 推荐 |
|------|------|------|
| CPU | 2 核 | 4 核 |
| 内存 | 2GB | 4GB |
| 磁盘 | 20GB SSD | 40GB SSD |
| 系统 | Ubuntu 22.04 / Debian 12 | Ubuntu 22.04 LTS |
| 带宽 | 5Mbps | 10Mbps+ |

### 4.2 目录结构

```
/opt/express-platform/
├── docker-compose.yml      # 生产编排
├── .env                    # 生产环境变量（权限 600）
├── api/                    # 后端构建产物
│   └── Dockerfile
├── web/                    # 前端静态文件
│   ├── user/
│   ├── courier/
│   └── admin/
├── mysql/                  # MySQL 数据持久化
├── redis/                  # Redis 数据持久化
└── nginx/                  # Nginx 配置
    └── conf.d/
```

### 4.3 生产 docker-compose.yml

```yaml
version: "3.8"

services:
  mysql:
    image: mysql:8.4
    container_name: express-mysql
    restart: always
    environment:
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      TZ: Asia/Vientiane
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_0900_ai_ci
      - --max-connections=200
    volumes:
      - ./mysql/data:/var/lib/mysql
    networks:
      - express-net
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h 127.0.0.1 -uroot -p$$MYSQL_ROOT_PASSWORD --silent"]
      interval: 10s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7.4-alpine
    container_name: express-redis
    restart: always
    command: ["redis-server", "--appendonly", "yes", "--requirepass", "${REDIS_PASSWORD}", "--maxmemory", "256mb", "--maxmemory-policy", "allkeys-lru"]
    volumes:
      - ./redis/data:/data
    networks:
      - express-net
    healthcheck:
      test: ["CMD-SHELL", "redis-cli -a $$REDIS_PASSWORD ping | grep PONG"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: api/Dockerfile
    container_name: express-api
    restart: always
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      PHONE_HASH_KEY: ${PHONE_HASH_KEY}
      FIELD_ENCRYPTION_KEY: ${FIELD_ENCRYPTION_KEY}
      PROVIDER_MODE: ${PROVIDER_MODE}
      KUAIDI100_ENABLED: ${KUAIDI100_ENABLED}
      KUAIDI100_KEY: ${KUAIDI100_KEY}
      KUAIDI100_CUSTOMER: ${KUAIDI100_CUSTOMER}
      KUAIDI100_SECRET: ${KUAIDI100_SECRET}
    ports:
      - "127.0.0.1:3000:3000"
    networks:
      - express-net

  nginx:
    image: nginx:1.27-alpine
    container_name: express-nginx
    restart: always
    depends_on:
      - api
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./web:/usr/share/nginx/html:ro
      - ./nginx/certs:/etc/nginx/certs:ro
    networks:
      - express-net

networks:
  express-net:
    driver: bridge
```

### 4.4 API Dockerfile

```dockerfile
# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# 先拷贝依赖定义
COPY package.json package-lock.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/ui-components/package.json ./packages/ui-components/
COPY apps/api/package.json ./apps/api/

RUN npm ci --workspaces --include-workspace-root

# 拷贝源码
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
COPY tsconfig.base.json ./

# 构建
RUN npm run build:packages
RUN npm run build:api

# ---- Runtime stage ----
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# 只拷贝运行时需要的文件
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

EXPOSE 3000
CMD ["node", "apps/api/dist/src/main.js"]
```

### 4.5 前端构建

```bash
# 构建用户端 H5
npm run build:h5 -w @express-platform/user-app

# 构建配送员端 H5
npm run build:h5 -w @express-platform/courier-app

# 构建管理后台
npm run build -w @express-platform/admin-web

# 产物位置
# apps/user-app/dist/build/h5/    -> /opt/express-platform/web/user/
# apps/courier-app/dist/build/h5/ -> /opt/express-platform/web/courier/
# apps/admin-web/dist/            -> /opt/express-platform/web/admin/
```

### 4.6 Nginx 配置

`nginx/conf.d/express.conf`：

```nginx
# API 反向代理
upstream express_api {
    server api:3000;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate     /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # API
    location /api/ {
        proxy_pass http://express_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        client_max_body_size 10m;
    }

    # Swagger 文档
    location /docs {
        proxy_pass http://express_api;
        proxy_set_header Host $host;
    }

    # 用户端
    location /user/ {
        alias /usr/share/nginx/html/user/;
        try_files $uri $uri/ /user/index.html;
    }

    # 配送员端
    location /courier/ {
        alias /usr/share/nginx/html/courier/;
        try_files $uri $uri/ /courier/index.html;
    }

    # 管理后台（默认根路径）
    location / {
        alias /usr/share/nginx/html/admin/;
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

## 五、环境变量清单

### 5.1 必须配置（生产环境）

| 变量 | 说明 | 示例 |
|------|------|------|
| `NODE_ENV` | 运行环境 | `production` |
| `DATABASE_URL` | MySQL 连接串 | `mysql://user:pass@mysql:3306/express_platform` |
| `REDIS_URL` | Redis 连接串 | `redis://:pass@redis:6379` |
| `JWT_ACCESS_SECRET` | Access Token 密钥（≥32字符随机） | 用 `openssl rand -hex 32` 生成 |
| `JWT_REFRESH_SECRET` | Refresh Token 密钥（≥32字符随机） | 用 `openssl rand -hex 32` 生成 |
| `PHONE_HASH_KEY` | 手机号哈希密钥 | 用 `openssl rand -hex 32` 生成 |
| `FIELD_ENCRYPTION_KEY` | 敏感字段加密密钥（64字符hex） | 用 `openssl rand -hex 32` 生成 |
| `PROVIDER_MODE` | 物流提供方模式 | `mock` 或 `real` |

### 5.2 可选配置

| 变量 | 说明 | 默认 |
|------|------|------|
| `PORT` | API 端口 | 3000 |
| `JWT_ACCESS_TTL_SECONDS` | Access Token 有效期（秒） | 900 |
| `JWT_REFRESH_TTL_DAYS` | Refresh Token 有效期（天） | 30 |
| `KUAIDI100_ENABLED` | 是否启用快递100真实接口 | false |
| `KUAIDI100_KEY` | 快递100 Key | - |
| `KUAIDI100_CUSTOMER` | 快递100 Customer | - |
| `KUAIDI100_SECRET` | 快递100 Secret | - |
| `GOOGLE_MAPS_API_KEY` | Google Maps Key | - |
| `MAPBOX_ACCESS_TOKEN` | Mapbox Token | - |
| `UPLOAD_MAX_BYTES` | 上传文件大小限制 | 5242880 (5MB) |

### 5.3 生成密钥命令

```bash
# 生成 32 字节随机 hex 字符串（64字符）
openssl rand -hex 32

# .env 文件权限
chmod 600 .env
chown root:root .env
```

## 六、数据库迁移与初始化

### 6.1 首次部署

```bash
# 1. 启动数据库容器
docker compose up -d mysql redis

# 2. 等待 MySQL 健康
docker compose exec mysql mysqladmin ping -uroot -p$MYSQL_ROOT_PASSWORD --silent

# 3. 运行迁移（在 API 容器或本地执行）
docker compose exec api npx prisma migrate deploy --schema apps/api/prisma/schema.prisma

# 4. 种子数据（创建管理员、演示用户、配送员、角色权限）
docker compose exec api node apps/api/dist/prisma/seed.js
```

### 6.2 后续更新

```bash
# 拉取新代码后
docker compose build api
docker compose up -d api

# 如果 schema 有变更
docker compose exec api npx prisma migrate deploy
```

### 6.3 数据备份

```bash
# 手动备份
docker compose exec mysql mysqldump -uroot -p$MYSQL_ROOT_PASSWORD --single-transaction --routines --triggers express_platform | gzip > backup_$(date +%Y%m%d).sql.gz

# 定时备份（crontab）
0 3 * * * /opt/express-platform/scripts/backup.sh
```

备份脚本 `scripts/backup.sh`：

```bash
#!/bin/bash
BACKUP_DIR="/opt/express-platform/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker compose -f /opt/express-platform/docker-compose.yml exec -T mysql \
  mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction express_platform \
  | gzip > "$BACKUP_DIR/express_$DATE.sql.gz"
# 保留最近 30 天
find "$BACKUP_DIR" -name "express_*.sql.gz" -mtime +30 -delete
```

## 七、安全加固清单

### 7.1 应用层

- [ ] 所有密钥使用 `openssl rand -hex 32` 生成，不使用示例值
- [ ] `.env` 文件权限 `600`，不提交到 Git
- [ ] 生产环境关闭 Swagger（或限制 IP 访问）
- [ ] 启用 Helmet、CORS 白名单、速率限制
- [ ] 密码 bcrypt 哈希（cost=12）
- [ ] 手机号 HMAC-SHA256 哈希 + AES-256-GCM 加密存储
- [ ] Refresh Token 仅存 SHA-256 哈希，支持撤销
- [ ] 上传文件限制 MIME 类型、大小、存储路径
- [ ] 日志不记录密码、完整手机号、Token

### 7.2 服务器层

- [ ] 启用防火墙（ufw），只开放 80/443
- [ ] SSH 禁用密码登录，使用密钥认证
- [ ] 定期 `apt update && apt upgrade`
- [ ] 安装 fail2ban 防暴力破解
- [ ] MySQL/Redis 不暴露公网，仅容器内网访问
- [ ] 配置 Nginx 限流（limit_req_zone）

### 7.3 HTTPS

```bash
# 使用 Let's Encrypt 免费证书
apt install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
# 自动续期（certbot 会自动配置 cron）
```

## 八、监控与日志

### 8.1 健康检查

- API 健康检查：`GET /api/v1/health`（返回 database、providerMode 状态）
- 容器健康检查：docker-compose 已配置 MySQL/Redis healthcheck

### 8.2 日志

```bash
# 查看 API 日志
docker compose logs -f api

# 查看 Nginx 访问日志
docker compose exec nginx tail -f /var/log/nginx/access.log

# 日志轮转（docker 自带）
# 在 docker-compose.yml 中配置
logging:
  driver: "json-file"
  options:
    max-size: "50m"
    max-file: "5"
```

### 8.3 简易监控脚本

```bash
#!/bin/bash
# scripts/health-check.sh
API=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/v1/health)
MYSQL=$(docker inspect -f '{{.State.Health.Status}}' express-mysql)
REDIS=$(docker inspect -f '{{.State.Health.Status}}' express-redis)

if [ "$API" != "200" ] || [ "$MYSQL" != "healthy" ] || [ "$REDIS" != "healthy" ]; then
  echo "[$(date)] ALERT: API=$API MySQL=$MYSQL REDIS=$REDIS"
  # 可接入企业微信/钉钉/邮件告警
fi
```

## 九、快递100 真实接口接入

当前默认 `PROVIDER_MODE=mock`，接入真实快递100：

1. 注册快递100开放平台：https://api.kuaidi100.com/register/diff/
2. 获取 Key、Customer、Secret
3. 在 `.env` 中配置：
   ```
   PROVIDER_MODE=real
   KUAIDI100_ENABLED=true
   KUAIDI100_KEY=你的key
   KUAIDI100_CUSTOMER=你的customer
   KUAIDI100_SECRET=你的secret
   ```
4. 重启 API：`docker compose restart api`

> 注意：快递100 Java SDK 位于 `java-demo/src/`，通过 `services/kuaidi100-adapter` 适配层调用。真实下单前请在快递100后台完成企业认证和充值。

## 十、常见问题

### Q1: 启动时报 `os error 10013` 套接字权限错误
A: 关闭 VPN/TUN 模式代理，或在 VS Code Codex 插件设置中启用 "Use No Local Server Auth"。

### Q2: npm install 失败 / workspace 包找不到
A: 检查 `node_modules/@express-platform/` 下是否有正确的符号链接。Windows 上可手动创建 junction：
```powershell
New-Item -ItemType Junction -Path node_modules/@express-platform/shared-types -Target packages/shared-types
```

### Q3: Prisma 迁移报错 "unique constraint on email_hash"
A: 开发环境使用 `prisma db push --accept-data-loss`；生产环境使用 `prisma migrate deploy`，确保现有数据无重复 email。

### Q4: 前端页面空白
A: 检查浏览器控制台，确认 `VITE_API_BASE_URL` 指向正确的 API 地址。生产环境需与 Nginx 路径一致。

### Q5: 验证码收不到
A: 开发/模拟环境验证码固定为 `123456`，不会真实发送短信/邮件。生产环境需接入短信服务商（如阿里云短信、Twilio）。

## 十一、部署检查清单

部署上线前逐项确认：

- [ ] 所有密钥已替换为随机生成值
- [ ] `.env` 权限 600，不在 Git 中
- [ ] MySQL/Redis 不暴露公网
- [ ] HTTPS 证书已配置且自动续期
- [ ] 防火墙只开放 80/443
- [ ] 数据库定时备份已配置
- [ ] 日志轮转已配置
- [ ] 健康检查 + 告警已配置
- [ ] 快递100 凭据已配置（如需真实物流）
- [ ] 演示账号密码已修改或禁用
- [ ] Swagger 文档已关闭或限制访问
- [ ] 前端构建产物已上传且 API 地址正确
