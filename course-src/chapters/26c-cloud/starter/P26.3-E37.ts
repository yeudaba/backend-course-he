// P26.3-E37: handler של Lambda מאחורי API Gateway
// כתוב וייצא async handler(event) → { statusCode, headers: { Content-Type: application/json }, body: מחרוזת JSON }
//   GET /health ← 200 {"ok":true} · POST /orders (productId שלם חיובי, qty 1–10) ← 202 · JSON שבור ← 400 · אחר ← 404
//
// בדיקה:  npm run check P26.3-E37
