// P19-E39: מ־pg ל־Prisma — מלאי נמוך
// כתוב וייצא async function lowStock(prisma, below) — כמו:
//   SELECT id, name, stock FROM products WHERE is_active AND stock < $1 ORDER BY stock, id
//
// בדיקה:  npm run check P19-E39
