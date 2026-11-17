// P20-E75: filter לכל שגיאה — גם JSON שבור ו־500
// כתוב וייצא AllErrorsFilter (@Catch(), נרשם עם APP_FILTER), ItemsController, ItemsModule
//   HttpException ← { error: { code, message } } | JSON שבור ← 400 INVALID_JSON | אחר ← 500 INTERNAL "שגיאה פנימית"
//
// בדיקה:  npm run check P20-E75
