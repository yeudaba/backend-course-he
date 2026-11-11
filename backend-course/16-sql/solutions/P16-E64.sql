SELECT
  COUNT(*)                AS customers,
  COUNT(phone)            AS with_phone,
  COUNT(*) - COUNT(phone) AS without_phone,
  COUNT(DISTINCT city)    AS cities,
  MIN(joined_on)          AS first_joined,
  MAX(joined_on)          AS last_joined
FROM customers;
