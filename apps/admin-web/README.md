# 管理后台

Vue 3 + TypeScript + Vite 管理后台。订单列表、详情与人工调度均调用 NestJS API；调度接口
仍由后端 `orders.dispatch` 权限校验。H5 本地预览端口为 `5175`。

```powershell
npm run dev -w @express-platform/admin-web
npm run build -w @express-platform/admin-web
```
