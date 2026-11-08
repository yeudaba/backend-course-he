-- P19.5-E12
-- עמודת JSON: ->> מחזיר טקסט (בלי מרכאות), -> מחזיר JSON. מספר — CAST, כדי למיין ולהשוות כמספר
SELECT name,
       attributes->>'$.material' AS material,
       CAST(attributes->>'$.cups' AS UNSIGNED) AS cups
FROM products
WHERE category = 'brewing'
  AND attributes->>'$.material' IS NOT NULL
ORDER BY cups IS NULL, cups DESC, name;
