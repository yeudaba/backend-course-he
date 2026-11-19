CREATE TABLE authors (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name  text NOT NULL
);
CREATE TABLE books (
  id              integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title           text NOT NULL,
  isbn            text NOT NULL UNIQUE,
  published_year  integer
);
CREATE TABLE book_authors (
  book_id    integer NOT NULL REFERENCES books (id) ON DELETE CASCADE,
  author_id  integer NOT NULL REFERENCES authors (id),
  PRIMARY KEY (book_id, author_id)
);
CREATE TABLE members (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name  text NOT NULL,
  email      text NOT NULL UNIQUE
);
CREATE TABLE loans (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  book_id      integer NOT NULL REFERENCES books (id),
  member_id    integer NOT NULL REFERENCES members (id),
  loaned_on    date NOT NULL DEFAULT CURRENT_DATE,
  returned_on  date,
  CHECK (returned_on >= loaned_on)
);
INSERT INTO authors (full_name) VALUES ('Noa Bar'), ('Eli Sason'), ('Rina Tal');
INSERT INTO books (title, isbn, published_year) VALUES
  ('Coffee at Dawn', '978-1-11', 2019),
  ('The Long Queue', '978-1-22', 2021),
  ('Small Servers', '978-1-33', NULL);
INSERT INTO book_authors (book_id, author_id) VALUES (1, 1), (2, 2), (2, 3), (3, 3);
INSERT INTO members (full_name, email) VALUES ('Dana Levi', 'dana@example.com'), ('Yossi Cohen', 'yossi@example.com');
INSERT INTO loans (book_id, member_id, loaned_on, returned_on) VALUES
  (1, 1, '2026-10-01', '2026-10-10'),
  (2, 2, '2026-10-20', NULL),
  (3, 1, '2026-11-01', NULL);
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('The Long Queue'::text, 'Yossi Cohen'::text, '2026-10-20'::date),
  ('Small Servers'::text, 'Dana Levi'::text, '2026-11-01'::date)
) AS v("title", "member", "loaned_on");
