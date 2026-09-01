-- AlterTable
ALTER TABLE `users` ADD COLUMN `email_encrypted` TEXT NULL,
    ADD COLUMN `email_hash` CHAR(64) NULL,
    ADD COLUMN `email_last4` VARCHAR(10) NULL,
    MODIFY `phone_hash` CHAR(64) NULL,
    MODIFY `phone_encrypted` TEXT NULL,
    MODIFY `phone_last4` CHAR(4) NULL;

ALTER TABLE `user_addresses` ADD COLUMN `formatted_address` VARCHAR(255) NULL,
    ADD COLUMN `landmark` VARCHAR(150) NULL,
    ADD COLUMN `map_provider` VARCHAR(30) NOT NULL DEFAULT 'MOCK',
    ADD COLUMN `place_id` VARCHAR(180) NULL,
    ADD COLUMN `street` VARCHAR(150) NULL,
    ADD COLUMN `village` VARCHAR(100) NULL;

ALTER TABLE `couriers` ADD COLUMN `service_area_id` CHAR(36) NULL;

ALTER TABLE `order_addresses` ADD COLUMN `formatted_address` VARCHAR(255) NULL,
    ADD COLUMN `landmark` VARCHAR(150) NULL,
    ADD COLUMN `map_provider` VARCHAR(30) NOT NULL DEFAULT 'MOCK',
    ADD COLUMN `place_id` VARCHAR(180) NULL,
    ADD COLUMN `street` VARCHAR(150) NULL,
    ADD COLUMN `village` VARCHAR(100) NULL;

ALTER TABLE `service_areas` ADD COLUMN `center_latitude` DECIMAL(10, 7) NULL,
    ADD COLUMN `center_longitude` DECIMAL(10, 7) NULL,
    ADD COLUMN `coordinate_status` VARCHAR(30) NOT NULL DEFAULT 'MOCK_UNVERIFIED',
    ADD COLUMN `country` VARCHAR(80) NOT NULL DEFAULT '老挝',
    ADD COLUMN `courier_display_name` VARCHAR(120) NULL,
    ADD COLUMN `currency` CHAR(3) NOT NULL DEFAULT 'LAK',
    ADD COLUMN `is_default` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `map_provider` VARCHAR(30) NOT NULL DEFAULT 'MOCK',
    ADD COLUMN `operations_center_name` VARCHAR(120) NULL,
    ADD COLUMN `out_of_area_message` VARCHAR(160) NOT NULL DEFAULT '当前位置暂不在服务范围内',
    ADD COLUMN `province` VARCHAR(100) NULL,
    ADD COLUMN `timezone` VARCHAR(60) NOT NULL DEFAULT 'Asia/Vientiane',
    ADD COLUMN `user_display_name` VARCHAR(120) NULL;

CREATE TABLE `verification_challenges` (
    `id` CHAR(36) NOT NULL,
    `target_hash` CHAR(64) NOT NULL,
    `channel` VARCHAR(10) NOT NULL,
    `code_hash` CHAR(64) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `expires_at` DATETIME(3) NOT NULL,
    `verified_at` DATETIME(3) NULL,
    `consumed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `verification_challenges_target_hash_created_at_idx`(`target_hash`, `created_at`),
    INDEX `verification_challenges_expires_at_consumed_at_idx`(`expires_at`, `consumed_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `system_settings` (
    `id` CHAR(36) NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    `value` JSON NOT NULL,
    `description` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `system_settings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `users_email_hash_key` ON `users`(`email_hash`);

ALTER TABLE `couriers` ADD CONSTRAINT `couriers_service_area_id_fkey`
    FOREIGN KEY (`service_area_id`) REFERENCES `service_areas`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
