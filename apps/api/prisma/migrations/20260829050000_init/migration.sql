-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `display_name` VARCHAR(80) NOT NULL,
    `phone_hash` CHAR(64) NOT NULL,
    `phone_encrypted` TEXT NOT NULL,
    `phone_last4` CHAR(4) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `status` ENUM('ACTIVE', 'DISABLED', 'LOCKED') NOT NULL DEFAULT 'ACTIVE',
    `token_version` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `users_phone_hash_key`(`phone_hash`),
    INDEX `users_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_addresses` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `label` VARCHAR(30) NULL,
    `contact_name` VARCHAR(80) NOT NULL,
    `phone_hash` CHAR(64) NOT NULL,
    `phone_encrypted` TEXT NOT NULL,
    `phone_last4` CHAR(4) NOT NULL,
    `country_code` CHAR(2) NOT NULL DEFAULT 'LA',
    `country` VARCHAR(80) NOT NULL,
    `province` VARCHAR(100) NULL,
    `city` VARCHAR(100) NOT NULL,
    `district` VARCHAR(100) NULL,
    `detail` VARCHAR(255) NOT NULL,
    `postal_code` VARCHAR(20) NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `is_default_sender` BOOLEAN NOT NULL DEFAULT false,
    `is_default_receiver` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `user_addresses_user_id_deleted_at_idx`(`user_id`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `couriers` (
    `id` CHAR(36) NOT NULL,
    `display_name` VARCHAR(80) NOT NULL,
    `phone_hash` CHAR(64) NOT NULL,
    `phone_encrypted` TEXT NOT NULL,
    `phone_last4` CHAR(4) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `account_status` ENUM('ACTIVE', 'DISABLED', 'LOCKED') NOT NULL DEFAULT 'ACTIVE',
    `work_status` ENUM('OFFLINE', 'AVAILABLE', 'BUSY', 'SUSPENDED') NOT NULL DEFAULT 'OFFLINE',
    `token_version` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `couriers_phone_hash_key`(`phone_hash`),
    INDEX `couriers_account_status_work_status_idx`(`account_status`, `work_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courier_locations` (
    `id` CHAR(36) NOT NULL,
    `courier_id` CHAR(36) NOT NULL,
    `latitude` DECIMAL(10, 7) NOT NULL,
    `longitude` DECIMAL(10, 7) NOT NULL,
    `accuracy_m` DECIMAL(8, 2) NULL,
    `heading` DECIMAL(6, 2) NULL,
    `speed_kph` DECIMAL(8, 2) NULL,
    `recorded_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `courier_locations_courier_id_recorded_at_idx`(`courier_id`, `recorded_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `administrators` (
    `id` CHAR(36) NOT NULL,
    `username` VARCHAR(60) NOT NULL,
    `display_name` VARCHAR(80) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `status` ENUM('ACTIVE', 'DISABLED', 'LOCKED') NOT NULL DEFAULT 'ACTIVE',
    `token_version` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `administrators_username_key`(`username`),
    INDEX `administrators_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(60) NOT NULL,
    `name` VARCHAR(80) NOT NULL,
    `description` VARCHAR(255) NULL,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `permissions_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `role_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_roles_user_id_role_id_key`(`user_id`, `role_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `administrator_roles` (
    `id` CHAR(36) NOT NULL,
    `administrator_id` CHAR(36) NOT NULL,
    `role_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `administrator_roles_administrator_id_role_id_key`(`administrator_id`, `role_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `id` CHAR(36) NOT NULL,
    `role_id` CHAR(36) NOT NULL,
    `permission_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `role_permissions_role_id_permission_id_key`(`role_id`, `permission_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_sessions` (
    `id` CHAR(36) NOT NULL,
    `subject_type` ENUM('USER', 'COURIER', 'ADMINISTRATOR', 'SYSTEM') NOT NULL,
    `subject_id` CHAR(36) NOT NULL,
    `token_hash` CHAR(64) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `revoked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_used_at` DATETIME(3) NULL,
    `user_agent` VARCHAR(255) NULL,
    `ip_hash` CHAR(64) NULL,

    UNIQUE INDEX `refresh_sessions_token_hash_key`(`token_hash`),
    INDEX `refresh_sessions_subject_type_subject_id_revoked_at_idx`(`subject_type`, `subject_id`, `revoked_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `express_orders` (
    `id` CHAR(36) NOT NULL,
    `order_no` VARCHAR(32) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `courier_id` CHAR(36) NULL,
    `service_type` ENUM('EXPRESS', 'PICKUP', 'SAME_CITY') NOT NULL,
    `status` ENUM('DRAFT', 'PENDING_CONFIRMATION', 'PENDING_DISPATCH', 'PENDING_ACCEPTANCE', 'ACCEPTED', 'PICKING_UP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'EXCEPTION') NOT NULL DEFAULT 'DRAFT',
    `scheduled_pickup_at` DATETIME(3) NULL,
    `estimated_fee` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `actual_fee` DECIMAL(12, 2) NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'LAK',
    `remark` VARCHAR(500) NULL,
    `is_mock` BOOLEAN NOT NULL DEFAULT true,
    `version` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `cancelled_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,

    UNIQUE INDEX `express_orders_order_no_key`(`order_no`),
    INDEX `express_orders_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `express_orders_courier_id_status_idx`(`courier_id`, `status`),
    INDEX `express_orders_status_service_type_created_at_idx`(`status`, `service_type`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_addresses` (
    `id` CHAR(36) NOT NULL,
    `order_id` CHAR(36) NOT NULL,
    `type` ENUM('SENDER', 'RECIPIENT') NOT NULL,
    `contact_name` VARCHAR(80) NOT NULL,
    `phone_hash` CHAR(64) NOT NULL,
    `phone_encrypted` TEXT NOT NULL,
    `phone_last4` CHAR(4) NOT NULL,
    `country_code` CHAR(2) NOT NULL DEFAULT 'LA',
    `country` VARCHAR(80) NOT NULL,
    `province` VARCHAR(100) NULL,
    `city` VARCHAR(100) NOT NULL,
    `district` VARCHAR(100) NULL,
    `detail` VARCHAR(255) NOT NULL,
    `postal_code` VARCHAR(20) NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `order_addresses_order_id_type_key`(`order_id`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` CHAR(36) NOT NULL,
    `order_id` CHAR(36) NOT NULL,
    `type` ENUM('DOCUMENT', 'CLOTHING', 'FOOD', 'DIGITAL', 'DAILY_NECESSITIES', 'OTHER') NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `weight_kg` DECIMAL(10, 3) NOT NULL,
    `declared_value` DECIMAL(12, 2) NULL,
    `notes` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `order_items_order_id_idx`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_status_logs` (
    `id` CHAR(36) NOT NULL,
    `order_id` CHAR(36) NOT NULL,
    `from_status` ENUM('DRAFT', 'PENDING_CONFIRMATION', 'PENDING_DISPATCH', 'PENDING_ACCEPTANCE', 'ACCEPTED', 'PICKING_UP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'EXCEPTION') NULL,
    `to_status` ENUM('DRAFT', 'PENDING_CONFIRMATION', 'PENDING_DISPATCH', 'PENDING_ACCEPTANCE', 'ACCEPTED', 'PICKING_UP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'EXCEPTION') NOT NULL,
    `operator_type` ENUM('USER', 'COURIER', 'ADMINISTRATOR', 'SYSTEM') NOT NULL,
    `operator_id` CHAR(36) NULL,
    `reason` VARCHAR(255) NULL,
    `request_id` VARCHAR(64) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `order_status_logs_order_id_created_at_idx`(`order_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipments` (
    `id` CHAR(36) NOT NULL,
    `order_id` CHAR(36) NOT NULL,
    `shipment_no` VARCHAR(40) NOT NULL,
    `provider_code` VARCHAR(40) NOT NULL,
    `provider_ref` VARCHAR(100) NULL,
    `status` ENUM('PENDING', 'CREATED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'EXCEPTION') NOT NULL DEFAULT 'PENDING',
    `is_mock` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `shipments_order_id_key`(`order_id`),
    UNIQUE INDEX `shipments_shipment_no_key`(`shipment_no`),
    INDEX `shipments_status_updated_at_idx`(`status`, `updated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tracking_events` (
    `id` CHAR(36) NOT NULL,
    `shipment_id` CHAR(36) NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `location` VARCHAR(150) NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `occurred_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `tracking_events_shipment_id_occurred_at_idx`(`shipment_id`, `occurred_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delivery_tasks` (
    `id` CHAR(36) NOT NULL,
    `order_id` CHAR(36) NOT NULL,
    `courier_id` CHAR(36) NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'PICKING_UP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'EXCEPTION') NOT NULL DEFAULT 'PENDING',
    `accepted_at` DATETIME(3) NULL,
    `pickup_at` DATETIME(3) NULL,
    `delivered_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `delivery_tasks_order_id_key`(`order_id`),
    INDEX `delivery_tasks_courier_id_status_idx`(`courier_id`, `status`),
    INDEX `delivery_tasks_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delivery_proofs` (
    `id` CHAR(36) NOT NULL,
    `task_id` CHAR(36) NOT NULL,
    `type` ENUM('PICKUP_PHOTO', 'DELIVERY_PHOTO', 'SIGNATURE', 'EXCEPTION_PHOTO') NOT NULL,
    `storage_key` VARCHAR(255) NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `size_bytes` INTEGER NOT NULL,
    `is_private` BOOLEAN NOT NULL DEFAULT true,
    `uploaded_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `delivery_proofs_task_id_created_at_idx`(`task_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_areas` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `country_code` CHAR(2) NOT NULL DEFAULT 'LA',
    `region` VARCHAR(100) NULL,
    `boundary` JSON NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `service_areas_code_key`(`code`),
    INDEX `service_areas_country_code_is_active_idx`(`country_code`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pricing_rules` (
    `id` CHAR(36) NOT NULL,
    `service_area_id` CHAR(36) NULL,
    `name` VARCHAR(100) NOT NULL,
    `service_type` ENUM('EXPRESS', 'PICKUP', 'SAME_CITY') NOT NULL,
    `base_fee` DECIMAL(12, 2) NOT NULL,
    `per_km_fee` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `per_kg_fee` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `minimum_fee` DECIMAL(12, 2) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'LAK',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `effective_from` DATETIME(3) NOT NULL,
    `effective_to` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `pricing_rules_service_type_is_active_effective_from_idx`(`service_type`, `is_active`, `effective_from`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_service_tickets` (
    `id` CHAR(36) NOT NULL,
    `ticket_no` VARCHAR(32) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `order_id` CHAR(36) NULL,
    `assigned_admin_id` CHAR(36) NULL,
    `subject` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM('OPEN', 'PROCESSING', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `priority` ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `resolved_at` DATETIME(3) NULL,

    UNIQUE INDEX `customer_service_tickets_ticket_no_key`(`ticket_no`),
    INDEX `customer_service_tickets_status_priority_created_at_idx`(`status`, `priority`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `order_id` CHAR(36) NULL,
    `channel` ENUM('IN_APP', 'SMS', 'PUSH', 'EMAIL') NOT NULL,
    `status` ENUM('PENDING', 'SENT', 'FAILED', 'READ') NOT NULL DEFAULT 'PENDING',
    `title` VARCHAR(120) NOT NULL,
    `content` VARCHAR(500) NOT NULL,
    `metadata` JSON NULL,
    `sent_at` DATETIME(3) NULL,
    `read_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `notifications_user_id_status_created_at_idx`(`user_id`, `status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `operation_logs` (
    `id` CHAR(36) NOT NULL,
    `administrator_id` CHAR(36) NULL,
    `operator_type` ENUM('USER', 'COURIER', 'ADMINISTRATOR', 'SYSTEM') NOT NULL,
    `operator_id` CHAR(36) NULL,
    `action` VARCHAR(100) NOT NULL,
    `resource_type` VARCHAR(80) NOT NULL,
    `resource_id` CHAR(36) NULL,
    `request_id` VARCHAR(64) NULL,
    `ip_hash` CHAR(64) NULL,
    `result` VARCHAR(30) NOT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `operation_logs_resource_type_resource_id_created_at_idx`(`resource_type`, `resource_id`, `created_at`),
    INDEX `operation_logs_operator_type_operator_id_created_at_idx`(`operator_type`, `operator_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_addresses` ADD CONSTRAINT `user_addresses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courier_locations` ADD CONSTRAINT `courier_locations_courier_id_fkey` FOREIGN KEY (`courier_id`) REFERENCES `couriers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `administrator_roles` ADD CONSTRAINT `administrator_roles_administrator_id_fkey` FOREIGN KEY (`administrator_id`) REFERENCES `administrators`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `administrator_roles` ADD CONSTRAINT `administrator_roles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `express_orders` ADD CONSTRAINT `express_orders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `express_orders` ADD CONSTRAINT `express_orders_courier_id_fkey` FOREIGN KEY (`courier_id`) REFERENCES `couriers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_addresses` ADD CONSTRAINT `order_addresses_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `express_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `express_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_status_logs` ADD CONSTRAINT `order_status_logs_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `express_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `express_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tracking_events` ADD CONSTRAINT `tracking_events_shipment_id_fkey` FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_tasks` ADD CONSTRAINT `delivery_tasks_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `express_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_tasks` ADD CONSTRAINT `delivery_tasks_courier_id_fkey` FOREIGN KEY (`courier_id`) REFERENCES `couriers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_proofs` ADD CONSTRAINT `delivery_proofs_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `delivery_tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pricing_rules` ADD CONSTRAINT `pricing_rules_service_area_id_fkey` FOREIGN KEY (`service_area_id`) REFERENCES `service_areas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_service_tickets` ADD CONSTRAINT `customer_service_tickets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_service_tickets` ADD CONSTRAINT `customer_service_tickets_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `express_orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_service_tickets` ADD CONSTRAINT `customer_service_tickets_assigned_admin_id_fkey` FOREIGN KEY (`assigned_admin_id`) REFERENCES `administrators`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `express_orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `operation_logs` ADD CONSTRAINT `operation_logs_administrator_id_fkey` FOREIGN KEY (`administrator_id`) REFERENCES `administrators`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
