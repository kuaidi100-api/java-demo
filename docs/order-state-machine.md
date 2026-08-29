# 订单状态机

## 1. 状态

```text
DRAFT
  -> PENDING_CONFIRMATION
  -> PENDING_DISPATCH
  -> PENDING_ACCEPTANCE
  -> ACCEPTED
  -> PICKING_UP
  -> PICKED_UP
  -> IN_TRANSIT
  -> DELIVERED
  -> COMPLETED
```

终止或旁路状态：`CANCELLED`、`EXCEPTION`。

## 2. 合法流转

| 当前状态 | 允许目标状态 |
|---|---|
| DRAFT | PENDING_CONFIRMATION、CANCELLED |
| PENDING_CONFIRMATION | PENDING_DISPATCH、CANCELLED |
| PENDING_DISPATCH | PENDING_ACCEPTANCE、CANCELLED、EXCEPTION |
| PENDING_ACCEPTANCE | ACCEPTED、CANCELLED、EXCEPTION |
| ACCEPTED | PICKING_UP、CANCELLED、EXCEPTION |
| PICKING_UP | PICKED_UP、EXCEPTION |
| PICKED_UP | IN_TRANSIT、EXCEPTION |
| IN_TRANSIT | DELIVERED、EXCEPTION |
| DELIVERED | COMPLETED、EXCEPTION |
| EXCEPTION | PENDING_DISPATCH、CANCELLED |
| COMPLETED | 无 |
| CANCELLED | 无 |

## 3. 执行规则

1. 前端只提交业务动作，不提交任意目标状态。
2. 后端根据主体类型、权限、当前状态和动作计算目标状态。
3. 状态更新使用数据库事务，并以 `version` 字段做乐观锁，避免重复接单和并发覆盖。
4. 每次成功流转必须同步新增 `order_status_logs`；日志记录前后状态、操作主体、原因、时间和请求 ID。
5. 状态未发生变化时不得写“成功”日志；重复提交返回当前资源，不重复产生副作用。
6. Mock Provider 的运单和轨迹必须保留 `mock_environment=true` 和 `MOCK-` 标识。
