// P16-E80: יצירת מוצר — Zod ואז INSERT
// כתוב וייצא productInput (Zod: name 2–100 אחרי trim, category מהרשימה, price חיובי ≤ 100000 עם 2 ספרות, stock שלם ≥ 0 ברירת מחדל 0)
// ו־async function createProduct(client, input) → parse (בלי מסד אם לא תקין), INSERT ... RETURNING עם פרמטרים ו־CURRENT_DATE
//   → { id, name, category, price: number, stock, isActive }
//
// בדיקה:  npm run check P16-E80
