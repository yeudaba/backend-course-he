-- נתוני הדוגמה של פרק 27 (שאלות SQL מראיונות): עובדים, לקוחות והזמנות.
-- טעינה (מתוך ~/dev/backend-course):  psql -d course -f 27-algorithms/files/interview.sql
-- אפשר להריץ שוב בכל רגע — הקובץ מוחק ובונה מחדש.
DROP TABLE IF EXISTS employees, orders, customers CASCADE;

CREATE TABLE employees (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        text NOT NULL,
  department  text NOT NULL,
  salary      integer NOT NULL,
  manager_id  integer REFERENCES employees(id)
);

INSERT INTO employees (name, department, salary, manager_id) VALUES
  ('Dana', 'engineering', 42000, NULL),
  ('Yossi', 'engineering', 31000, 1),
  ('Noa', 'engineering', 31000, 1),
  ('Avi', 'engineering', 24000, 2),
  ('Maya', 'sales', 28000, NULL),
  ('Omer', 'sales', 19000, 5),
  ('Tamar', 'sales', 22000, 5),
  ('Eli', 'support', 16000, NULL),
  ('Shira', 'support', 16000, 8);

CREATE TABLE customers (
  id      integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name    text NOT NULL,
  email   text NOT NULL,
  city    text NOT NULL
);

INSERT INTO customers (name, email, city) VALUES
  ('Dana Levi', 'dana@example.com', 'Haifa'),
  ('Yossi Cohen', 'yossi@example.com', 'Tel Aviv'),
  ('Dana L.', 'DANA@example.com', 'Haifa'),
  ('Noa Mizrahi', 'noa@example.com', 'Tel Aviv'),
  ('Avi Peretz', 'avi@example.com', 'Jerusalem'),
  ('Adi Katz', 'adi@example.com', 'Haifa'),
  ('Avi P.', ' avi@example.com', 'Jerusalem'),
  ('Omer Biton', 'omer@example.com', 'Beer Sheva');

CREATE TABLE orders (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id  integer NOT NULL REFERENCES customers(id),
  total        numeric(10, 2) NOT NULL,
  status       text NOT NULL,
  created_on   date NOT NULL
);

INSERT INTO orders (customer_id, total, status, created_on) VALUES
  (1, 189.00, 'paid', '2026-10-01'),
  (2, 89.90, 'paid', '2026-10-01'),
  (1, 24.90, 'cancelled', '2026-10-02'),
  (4, 649.00, 'paid', '2026-10-03'),
  (2, 119.00, 'paid', '2026-10-05'),
  (6, 39.00, 'paid', '2026-10-05'),
  (5, 229.00, 'cancelled', '2026-10-06'),
  (4, 29.90, 'paid', '2026-10-08'),
  (6, 249.00, 'paid', '2026-10-09'),
  (1, 99.00, 'paid', '2026-10-12');
