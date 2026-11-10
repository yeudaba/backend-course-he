// P26.5-E26: להחזיר סדר להודעות — מקובץ ריק
// כתוב וייצא class ReorderBuffer<T>:
//   constructor(deliver: (seq: number, message: T) => void, startSeq = 1)
//   push(seq, message) → "delivered" | "buffered" | "duplicate"
//     seq הבא בתור ← מוסרת, ואחריה כל מי שחיכתה ברצף · גבוה יותר ← מחכה · כבר נמסרה או כבר מחכה ← duplicate
//     seq לא שלם ← TypeError
//   get nextSeq · get pending (כמה מחכות) · gaps() — המספרים שחסרים עד הגבוה שמחכה · שדות פרטיים (#)
//
// הרצה:   node 26w-messaging/starter/P26.5-E26.ts
// בדיקה:  npm run check P26.5-E26
