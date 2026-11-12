-- יחידה 25.5, שיעור 1: קופונים (קולציה) ואירועים (DATETIME מול TIMESTAMP)
DROP TABLE IF EXISTS coupons, events, places;

CREATE TABLE coupons (
  id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code     VARCHAR(20) NOT NULL,
  discount INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO coupons (code, discount) VALUES
  ('SAVE10', 10), ('save10', 15), ('Save10', 20), ('SAVE20', 20), ('Café', 5), ('CAFE', 7);

CREATE TABLE events (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(50) NOT NULL,
  at_datetime  DATETIME NOT NULL,
  at_timestamp TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE places (
  id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO places (name, city) VALUES
  ('Café Noir', 'Tel Aviv'), ('CAFE Hafuch', 'Haifa'), ('cafeteria 24', 'Haifa'),
  ('Kafe Mul Hayam', 'Jaffa'), ('Caffè Roma', 'Jerusalem'), ('Bakery Café', 'Tel Aviv');
