-- P25-E67: טבלת משימות לפני שינוי השם title ← name
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title text NOT NULL,
  done boolean NOT NULL DEFAULT false
);
INSERT INTO tasks (title, done) VALUES ('לקנות חלב', false), ('לשלם חשבון חשמל', true), ('לתקן את ה־CI', false);
