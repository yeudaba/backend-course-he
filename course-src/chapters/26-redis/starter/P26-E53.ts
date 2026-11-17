// P26-E53: רענון מוקדם ברקע
// כתוב וייצא async getWithEarlyRefresh(redis, key, ttl, load, refreshBelow)
//   אין ← load ושמירה · יש ונשארו פחות מ־refreshBelow שניות ← מחזירים מיד, ורענון אחד ברקע
//   (מנעול <key>:refresh עם SET NX EX 10) · רענון שנכשל לא מפיל כלום
//
// בדיקה:  npm run check P26-E53
