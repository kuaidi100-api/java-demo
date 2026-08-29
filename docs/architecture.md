# 快递综合服务平台架构设计（A–G 基础阶段）

## 1. 目标与边界

本阶段只交付可运行的基础设施、数据模型和 NestJS 最小 API，不进入用户端、配送员端或管理后台的大规模页面开发。

现有 `src/`、`pom.xml` 及 Java SDK 保持原位、独立构建，不移动也不修改其核心源码。平台后端通过 `services/kuaidi100-adapter` 中定义的适配边界调用 SDK；没有正式凭据时，真实快递100能力保持关闭。

## 2. 总体结构

```text
apps/user-app       ─┐
apps/courier-app    ─┼─ HTTPS/JSON ─> apps/api ─> MySQL 8
apps/admin-web      ─┘                    │       Redis
                                         │
                                         ├─ LogisticsProvider
                                         ├─ MapProvider
                                         ├─ SmsProvider
                                         ├─ StorageProvider
                                         ├─ PaymentProvider（仅接口）
                                         └─ NotificationProvider
```

`apps/api` 是唯一允许修改订单状态的入口。客户端只提交动作，例如“确认订单”“接单”“确认取件”，后端在事务内验证状态转换并写入 `order_status_logs`。

## 3. 模块职责

- `apps/api`：认证、用户、地址、订单、运单、配送、RBAC、Swagger、统一异常处理。
- `apps/user-app`：uni-app 用户端，后续阶段实现。
- `apps/courier-app`：uni-app 配送员端，后续阶段实现。
- `apps/admin-web`：Vue 3 管理后台，后续阶段实现。
- `services/kuaidi100-adapter`：Java SDK 服务化边界及真实 Provider 占位，不保存凭据。
- `packages/shared-types`：跨端 DTO、枚举和状态类型。
- `packages/api-client`：统一 HTTP 客户端与 Token 刷新接口。
- `packages/ui-components`：木棉橙主题基础组件占位。
- `infrastructure/database`：Prisma Migration、初始化说明。
- `infrastructure/docker`：容器健康检查与本地基础设施说明。

## 4. 安全架构

- 密码使用 bcrypt 哈希，永不保存明文。
- Access Token 短时有效；Refresh Token 只保存 SHA-256 哈希，并支持撤销与 Token Version。
- 手机号以 HMAC-SHA-256 结果建立唯一索引，以 AES-256-GCM 密文保存，仅返回脱敏值。
- 管理端通过角色、权限、角色权限和管理员角色关联实现 RBAC。
- DTO 使用白名单校验，未知字段拒绝；接口启用速率限制、Helmet 和统一异常结构。
- 日志仅记录请求 ID、动作、脱敏主体和结果，不记录密码、完整手机号或 Token。
- 上传能力只暴露 `StorageProvider`，MVP 的本地实现限制 MIME、大小和路径。
- `.env`、上传文件、数据库卷和正式凭据全部排除出 Git。

## 5. 外部能力策略

- 开发环境默认 `PROVIDER_MODE=mock`，API 返回 `mockEnvironment: true`，Swagger 描述明确标注模拟环境。
- `MockLogisticsProvider` 生成 `MOCK-` 前缀运单并追加模拟轨迹，不声称真实寄件成功。
- `Kuaidi100Provider` 仅做关闭状态的连接占位；缺少开关或凭据时必须拒绝调用。
- 地图首选 Google Maps，备用 Mapbox；本阶段只定义接口和占位实现。
- 支付仅定义 `PaymentProvider`，所有支付动作返回“未启用”，不创建虚假支付成功记录。

## 6. 运行与部署

- 本地基础设施由根目录 `docker-compose.yml` 启动 MySQL 8 和 Redis。
- Prisma Migration 是唯一数据库结构变更入口，禁止运行时自动同步生产 Schema。
- Windows 使用 `scripts/start-dev.ps1` 完成环境检查、容器启动、迁移、种子和 API 启动。
- API 默认端口 `3000`，Swagger 为 `/docs`，健康检查为 `/api/v1/health`。
