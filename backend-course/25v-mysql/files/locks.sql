-- יחידה 25.5, שיעור 3: ארנקים, מושבים וצפיות — לתרגילי נעילות ומקביליות
DROP TABLE IF EXISTS wallets, seats, product_views;

CREATE TABLE wallets (
  customer_id INT UNSIGNED PRIMARY KEY,
  balance     INT NOT NULL,
  CONSTRAINT chk_wallet_balance CHECK (balance >= 0)
) ENGINE=InnoDB;
INSERT INTO wallets (customer_id, balance) VALUES (1, 100), (2, 50), (3, 0), (4, 1000);

CREATE TABLE seats (
  id          INT UNSIGNED PRIMARY KEY,
  label       VARCHAR(10) NOT NULL,
  reserved_by INT UNSIGNED NULL
) ENGINE=InnoDB;
INSERT INTO seats (id, label, reserved_by) VALUES (1, 'A1', NULL), (2, 'A2', NULL), (3, 'A3', 7);

CREATE TABLE product_views (
  product_id INT UNSIGNED NOT NULL,
  day        DATE NOT NULL,
  views      INT NOT NULL,
  PRIMARY KEY (product_id, day)
) ENGINE=InnoDB;
