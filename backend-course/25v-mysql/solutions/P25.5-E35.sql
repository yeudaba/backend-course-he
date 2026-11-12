-- P25.5-E35: קוד קופון — בדיוק או בערך?
SELECT code, discount,
       code = 'save10' AS ci_match,
       code = 'save10' COLLATE utf8mb4_0900_bin AS exact_match
FROM coupons
ORDER BY id;
