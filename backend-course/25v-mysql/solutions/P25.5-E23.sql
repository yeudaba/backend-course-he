-- P25.5-E23
-- תקלה 1: CHARSET utf8 ב־MySQL הוא utf8mb3 — 3 בתים לתו, ואמוג׳י (4 בתים) נכשל ← utf8mb4
-- תקלה 2: FLOAT לכסף ← 89.90 נשמר כ־89.9000015…; DECIMAL(10,2) מדויק
-- תקלה 3: TIMESTAMP לתאריך לידה ← טווח 1970–2038 בלבד; תאריך בלי שעה — DATE
CREATE TABLE members (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  bio        TEXT NOT NULL,
  balance    DECIMAL(10, 2) NOT NULL DEFAULT 0,
  birth_date DATE NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
