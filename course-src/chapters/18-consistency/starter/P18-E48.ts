// P18-E48: שמירת מלאי עם כלל "מלאי נמוך"
// כתוב וייצא class AppError (עם code) ו־async function reserve(pool, productId, qty): Promise<number>
//   transaction + SELECT stock ... FOR UPDATE; PRODUCT_NOT_FOUND / LOW_STOCK_LIMIT (stock < 5 ו־qty > 2) / OUT_OF_STOCK
//   אחרת — הורדה, ומחזירה את המלאי שנשאר
//
// בדיקה:  npm run check P18-E48
