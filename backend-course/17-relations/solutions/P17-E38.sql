-- ב־products לא מעדכנים כלום: הם מצביעים על id 1, והשם נמצא רק ב־categories
UPDATE categories SET name = 'coffee beans' WHERE name = 'beans';
INSERT INTO categories (name) VALUES ('tea');

SELECT id, name FROM categories ORDER BY id;
