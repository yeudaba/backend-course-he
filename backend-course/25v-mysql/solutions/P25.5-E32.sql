-- P25.5-E32: טבלת קודי הנחה
CREATE TABLE promo_codes (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(20) COLLATE utf8mb4_0900_bin NOT NULL,
  percent     TINYINT UNSIGNED NOT NULL,
  uses_left   INT UNSIGNED NOT NULL DEFAULT 1,
  valid_until DATE NULL,
  product_id  INT UNSIGNED NULL,
  UNIQUE KEY uq_promo_codes_code (code),
  CONSTRAINT chk_promo_percent CHECK (percent BETWEEN 1 AND 90),
  CONSTRAINT fk_promo_product FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
