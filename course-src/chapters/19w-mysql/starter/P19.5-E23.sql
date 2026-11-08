-- P19.5-E23
-- "המשתמשים לא מצליחים לשמור bio עם אמוג׳י, היתרות לא מסתדרות באגורות, ותאריכי לידה לפני 1970 נדחים" — שלוש תקלות
CREATE TABLE members (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  bio        TEXT NOT NULL,
  balance    FLOAT NOT NULL DEFAULT 0,
  birth_date TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
