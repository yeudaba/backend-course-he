// P26-E93: getOrSet — HIT, MISS או OFF
// כתוב וייצא:
//   getOrSet(redis | null, group, key, ttl, load) → { value, status: "HIT" | "MISS" | "OFF" }
//     גרסה ב־v:<group> · מפתח cache:<group>:<version>:<key> · Redis נפל ← OFF · load זרק ← עולה
//   invalidate(redis | null, group) → INCR לגרסה, בלי לזרוק
//
// בדיקה:  npm run check P26-E93
