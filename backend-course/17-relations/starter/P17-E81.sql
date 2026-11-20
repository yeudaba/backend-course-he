-- P17-E81: ביקורות — הקובץ רץ, אבל שלוש דרישות לא נאכפות. תקן את CREATE TABLE בלבד.
-- מוצר וחבר חובה וקיימים · rating 1–5 · ביקורת אחת לכל לקוח ומוצר
-- מוצר נמחק ← הביקורות שלו נמחקות · לקוח עם ביקורות ← אי אפשר למחוק
--
-- בדיקה:  npm run check P17-E81
CREATE TABLE reviews (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id   integer REFERENCES products (id),
  customer_id  integer NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
  rating       integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body         text
);

INSERT INTO reviews (product_id, customer_id, rating, body) VALUES
  (5, 4, 5, 'Great grinder'),
  (5, 8, 3, NULL),
  (1, 4, 4, 'Good beans');

SELECT product_id, customer_id, rating FROM reviews ORDER BY product_id, customer_id;
