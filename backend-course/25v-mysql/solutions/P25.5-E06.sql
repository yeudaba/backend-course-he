-- P25.5-E06
-- טבלת ביקורות ב־MySQL: מפתח AUTO_INCREMENT, utf8mb4 (אמוג׳י!), CHECK שנאכף (מ־8.0.16), מפתחות זרים,
-- ייחודיות "ביקורת אחת למוצר ללקוח", ואינדקס לשאילתה הנפוצה (הביקורות של מוצר, מהחדשה)
CREATE TABLE reviews (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  INT UNSIGNED NOT NULL,
  customer_id INT UNSIGNED NOT NULL,
  rating      TINYINT UNSIGNED NOT NULL,
  body        TEXT NOT NULL,
  created_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_id) REFERENCES customers (id),
  CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5),
  UNIQUE KEY uq_reviews_product_customer (product_id, customer_id),
  KEY idx_reviews_product_created (product_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
