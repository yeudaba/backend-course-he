// P29-E28: תבנית prompt עם משתנים — חזרה על replace עם regex ופונקציה, Set ו־Object.hasOwn
// כתוב וייצא renderPrompt(template, vars: Record<string, string>, untrusted: string[] = []): string
//   {{name}} / {{ name }} ← vars.name · ערך לא נקרא שוב כתבנית, ו־$& בערך נשאר כמו שהוא
//   חסר משתנה ← Error עם השם · משתנה ב־vars שלא בשימוש ← Error עם השם
//   שם ב־untrusted ← <document name="שם">\nערך\n</document>, ו־</document> בתוך הערך ← &lt;/document&gt;
//
// הרצה:   node 29-ai-backend/starter/P29-E28.ts
// בדיקה:  npm run check P29-E28
