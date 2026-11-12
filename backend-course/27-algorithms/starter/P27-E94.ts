// P27-E94: SQL injection — tagged template שמייצר פרמטרים
// כתוב וייצא sql`...${value}...` → { text: "... $1 ...", values: [value] } · מערך ← $1, $2, $3
//
// בדיקה:  npm run check P27-E94
