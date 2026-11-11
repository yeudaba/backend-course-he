// P23-E28: כמה מקום תופסים ה־images? — חזרה על switch, reduce, toFixed ו־while
// כתוב וייצא (יחידות עשרוניות, כמו Docker: kB = 1000):
//   parseSize("245MB") → 245000000 — B, kB/KB, MB, GB, TB (עם switch), אחרת Error
//   formatSize(bytes) → "999B" / "12.3kB" / "245MB" / "1.5GB" — ספרה אחת אחרי הנקודה, בלי ".0"
//   totalSize(dockerImagesOutput) → סכום עמודת SIZE, מעוצב (העמודות מופרדות ב־2 רווחים או יותר)
//
// הרצה:   node 23-docker/starter/P23-E28.ts
// בדיקה:  npm run check P23-E28
