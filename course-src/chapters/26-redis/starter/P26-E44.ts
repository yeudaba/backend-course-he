// P26-E44: פרופיל — Zod לפני HSET, וטיפוסים בחזרה
// כתוב וייצא:
//   saveProfile(redis, userId, input) → { name, city, age, newsletter } אחרי בדיקה עם zod (לא תקין: Error("VALIDATION_ERROR"))
//     HSET ל־profile:<userId>, newsletter כ־"1"/"0"
//   loadProfile(redis, userId) → אותו אובייקט עם טיפוסים, או null
//
// בדיקה:  npm run check P26-E44
