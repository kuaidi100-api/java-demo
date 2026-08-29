# 快递100适配服务

现有根目录 Java SDK 保持不变。本目录定义未来服务化封装边界；当前阶段由 NestJS 的 `LogisticsProvider` 提供 `MockLogisticsProvider` 和关闭状态的 `Kuaidi100Provider`。

启用真实连接必须同时满足：

1. `KUAIDI100_ENABLED=true`；
2. 本地 `.env` 中存在完整凭据；
3. 使用明确授权的沙箱或正式账号；
4. 不批量运行原 SDK 的下单、短信或打印集成测试。
