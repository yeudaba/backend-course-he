-- P25.5-E35: קוד קופון — בדיוק או בערך?
SELECT code, discount,
       code = 'save10' AS ci_match,
       code = 'save10' AS exact_match
FROM coupons
ORDER BY id;
