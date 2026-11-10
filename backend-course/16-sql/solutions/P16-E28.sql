SELECT
  full_name,
  CASE city
    WHEN 'Tel Aviv' THEN 'center'
    WHEN 'Ramat Gan' THEN 'center'
    WHEN 'Haifa' THEN 'north'
    WHEN 'Jerusalem' THEN 'jerusalem'
    WHEN 'Beer Sheva' THEN 'south'
    ELSE 'unknown'
  END AS region,
  COALESCE(phone, email) AS contact
FROM customers
ORDER BY
  CASE city
    WHEN 'Tel Aviv' THEN 1
    WHEN 'Ramat Gan' THEN 1
    WHEN 'Haifa' THEN 2
    WHEN 'Jerusalem' THEN 3
    WHEN 'Beer Sheva' THEN 4
    ELSE 5
  END,
  full_name;
