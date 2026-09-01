-- Unified order payment/coupon fields and expanded service types.

ALTER TABLE `express_orders`
  ADD COLUMN `payment_status` ENUM('UNPAID', 'PENDING_CONFIRM', 'PAID', 'REFUNDED') NOT NULL DEFAULT 'UNPAID',
  ADD COLUMN `coupon_id` CHAR(36) NULL,
  ADD COLUMN `discount_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  ADD COLUMN `extra` JSON NULL,
  MODIFY `currency` CHAR(3) NOT NULL DEFAULT 'CNY',
  MODIFY `service_type` ENUM('EXPRESS', 'PICKUP', 'SAME_CITY', 'PURCHASE', 'HOTEL', 'TICKET', 'MOVING', 'PHOTO', 'RIDE') NOT NULL;

ALTER TABLE `express_orders`
  ADD INDEX `express_orders_payment_status_created_at_idx` (`payment_status`, `created_at`);

ALTER TABLE `couriers`
  ADD COLUMN `rider_code` VARCHAR(40) NULL,
  ADD COLUMN `deposit_balance` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  ADD COLUMN `deposit_threshold` DECIMAL(12, 2) NOT NULL DEFAULT 200.00;

ALTER TABLE `couriers`
  ADD UNIQUE INDEX `couriers_rider_code_key` (`rider_code`);

ALTER TABLE `tracking_events`
  ADD COLUMN `is_manual` BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE `customer_service_tickets`
  ADD COLUMN `issue_type` ENUM('DAMAGE', 'ATTITUDE', 'OVERCHARGE', 'OTHER') NOT NULL DEFAULT 'OTHER',
  ADD COLUMN `penalty_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  ADD COLUMN `admin_note` VARCHAR(500) NULL;

ALTER TABLE `pricing_rules`
  MODIFY `service_type` ENUM('EXPRESS', 'PICKUP', 'SAME_CITY', 'PURCHASE', 'HOTEL', 'TICKET', 'MOVING', 'PHOTO', 'RIDE') NOT NULL;

CREATE TABLE `order_freight_details` (
  `id` CHAR(36) NOT NULL,
  `order_id` CHAR(36) NOT NULL,
  `channel` ENUM('NEXT_DAY', 'ECONOMY') NOT NULL,
  `domestic_tracking_no` VARCHAR(64) NOT NULL,
  `actual_weight` DECIMAL(8, 2) NULL,
  `volume_weight` DECIMAL(8, 2) NULL,
  `billed_weight` DECIMAL(8, 2) NULL,
  `length_cm` DECIMAL(8, 2) NULL,
  `width_cm` DECIMAL(8, 2) NULL,
  `height_cm` DECIMAL(8, 2) NULL,
  `warehouse_status` ENUM('AWAITING_INBOUND', 'RECEIVED', 'DEPARTED', 'EXCEPTION') NOT NULL DEFAULT 'AWAITING_INBOUND',
  `is_unclaimed` BOOLEAN NOT NULL DEFAULT false,
  `claimed_by_user_id` CHAR(36) NULL,
  `third_party_code` VARCHAR(64) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `order_freight_details_order_id_key` (`order_id`),
  INDEX `order_freight_details_domestic_tracking_no_idx` (`domestic_tracking_no`),
  INDEX `order_freight_details_warehouse_status_is_unclaimed_idx` (`warehouse_status`, `is_unclaimed`),
  CONSTRAINT `order_freight_details_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `express_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `order_errand_details` (
  `id` CHAR(36) NOT NULL,
  `order_id` CHAR(36) NOT NULL,
  `delivery_area_type` TINYINT NOT NULL,
  `weight_tier` TINYINT NOT NULL,
  `item_description` VARCHAR(255) NOT NULL,
  `payment_method` ENUM('CASH', 'WECHAT', 'ALIPAY') NOT NULL,
  `settlement_loc` ENUM('PICKUP', 'DROPOFF') NOT NULL,
  `pickup_img_key` VARCHAR(255) NULL,
  `payment_img_key` VARCHAR(255) NULL,
  `cancel_reason` VARCHAR(255) NULL,
  `timeout_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `order_errand_details_order_id_key` (`order_id`),
  INDEX `order_errand_details_delivery_area_type_weight_tier_idx` (`delivery_area_type`, `weight_tier`),
  CONSTRAINT `order_errand_details_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `express_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `order_purchase_details` (
  `id` CHAR(36) NOT NULL,
  `order_id` CHAR(36) NOT NULL,
  `product_url` VARCHAR(1000) NOT NULL,
  `quote_amount` DECIMAL(12, 2) NULL,
  `service_fee` DECIMAL(12, 2) NULL,
  `admin_note` VARCHAR(500) NULL,
  `quoted_at` DATETIME(3) NULL,
  `confirmed_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `order_purchase_details_order_id_key` (`order_id`),
  CONSTRAINT `order_purchase_details_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `express_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `order_service_requests` (
  `id` CHAR(36) NOT NULL,
  `order_id` CHAR(36) NOT NULL,
  `contact_name` VARCHAR(80) NOT NULL,
  `phone_last4` CHAR(4) NOT NULL,
  `phone_hash` CHAR(64) NOT NULL,
  `phone_encrypted` TEXT NOT NULL,
  `detail` VARCHAR(1000) NOT NULL,
  `payload` JSON NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `order_service_requests_order_id_key` (`order_id`),
  CONSTRAINT `order_service_requests_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `express_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `freight_rules` (
  `id` CHAR(36) NOT NULL,
  `channel` ENUM('NEXT_DAY', 'ECONOMY') NOT NULL,
  `base_weight` DECIMAL(8, 2) NOT NULL,
  `base_price` DECIMAL(8, 2) NOT NULL,
  `step_weight` DECIMAL(8, 2) NOT NULL,
  `step_price` DECIMAL(8, 2) NOT NULL,
  `currency` CHAR(3) NOT NULL DEFAULT 'CNY',
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `freight_rules_channel_key` (`channel`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `finance_ledgers` (
  `id` CHAR(36) NOT NULL,
  `order_id` CHAR(36) NULL,
  `courier_id` CHAR(36) NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `type` ENUM('ONLINE_REVENUE', 'CASH_REVENUE', 'DEPOSIT_DEDUCT', 'RIDER_PAYOUT', 'PLATFORM_CUT') NOT NULL,
  `batch_date` VARCHAR(32) NOT NULL,
  `platform_cut` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `rider_cut` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `note` VARCHAR(255) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `finance_ledgers_batch_date_type_idx` (`batch_date`, `type`),
  INDEX `finance_ledgers_courier_id_created_at_idx` (`courier_id`, `created_at`),
  CONSTRAINT `finance_ledgers_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `express_orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `finance_ledgers_courier_id_fkey` FOREIGN KEY (`courier_id`) REFERENCES `couriers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
