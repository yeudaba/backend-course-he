// P19-E27: עמוד מוצרים: רשימה וספירה במקביל — חזרה על Promise.all
// כתוב וייצא getProductPage(prisma, { page = 1, pageSize = 5, categoryId } = {}) → { items, page, total, pages }
//   רק פעילים (ועם categoryId — רק ממנה). items: { id, name, price: number } לפי id. pages = Math.ceil(total / pageSize)
//   findMany ו־count במקביל (Promise.all), עם אותו where
//   page לא שלם חיובי → RangeError("page חייב להיות מספר שלם חיובי") | pageSize לא 1–50 → RangeError("pageSize חייב להיות 1–50")
// import type { PrismaClient } from "../files/generated/prisma/client.ts";
//
// בדיקה:  npm run check P19-E27
