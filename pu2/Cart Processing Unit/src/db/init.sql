-- ─────────────────────────────────────────────────────────
--Flash Sale DB – Init Script
--Chạy tự động khi MariaDB container khởi động lần đầu
-- ─────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS flashsale CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE flashsale;

--Bảng lưu lịch sử đơn hàng(từ PU3 checkout)
CREATE TABLE IF NOT EXISTS orders(
    id           VARCHAR(36)    PRIMARY KEY,
    user_id      VARCHAR(100)   NOT NULL,
    total_price  DECIMAL(15, 2)  NOT NULL,
    status       ENUM('pending', 'confirmed', 'failed') DEFAULT 'pending',
    items        JSON           NOT NULL,
    created_at   DATETIME       DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id(user_id),
    INDEX idx_status(status),
    INDEX idx_created(created_at)
) ENGINE = InnoDB;

--Bảng log thao tác cart(audit trail)
CREATE TABLE IF NOT EXISTS cart_logs(
    id         BIGINT         AUTO_INCREMENT PRIMARY KEY,
    user_id    VARCHAR(100)   NOT NULL,
    action     ENUM('add', 'remove', 'clear', 'checkout') NOT NULL,
    product_id VARCHAR(100),
    quantity   INT,
    note       VARCHAR(255),
    created_at DATETIME       DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id(user_id),
    INDEX idx_action(action)
) ENGINE = InnoDB;

--Seed data mẫu(optional, để test)
INSERT IGNORE INTO orders(id, user_id, total_price, status, items) VALUES
    ('order-demo-001', 'user01', 198000.00, 'confirmed',
        '[{"productId":"sp001","name":"Áo thun","price":99000,"quantity":2}]');