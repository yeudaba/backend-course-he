// P24-E99: reserve עם P2002
// כתוב וייצא async reserve(db, userId, key, fingerprint, now, ttlHours) ← { kind: "new" | "in_progress" | "mismatch" | "replay" }
//   create ← P2002 ← findUnique ← (פג תוקף ← deleteById) ← לכל היותר 2 סיבובים
//
// בדיקה:  npm run check P24-E99
