// P29-E26: לחלק מסמכים לקטעים, ולמצוא את הרלוונטיים — מקובץ ריק
// כתוב וייצא:
//   chunk(text, maxChars = 500): string[]
//     פסקאות (מופרדות בשורה ריקה) ← קטעים של עד maxChars, מחוברים ב־"\n\n" · פסקה ארוכה מדי ← משפטים (אחרי . ! ?)
//     משפט ארוך מדי ← חיתוך כל maxChars · maxChars לא שלם חיובי ← RangeError
//   retrieve(chunks, question, k = 3) → [{ index, score, text }]
//     מילים = רצפים של 3+ אותיות/ספרות, בלי תלות באותיות גדולות · score = כמה מילים שונות מהשאלה מופיעות בקטע
//     רק score > 0, מהגבוה, בתיקו לפי index, לכל היותר k
//
// הרצה:   node 29-ai-backend/starter/P29-E26.ts
// בדיקה:  npm run check P29-E26
