// P12-E53: לנסות שוב — רק כשכדאי
// כתוב וייצא (export):
//   class TemporaryError extends Error (name נכון)
//   retryTemporary<T>(fn: (attempt: number) => Promise<T>, attempts: number): Promise<T>
//     TemporaryError (או תת־מחלקה) → ניסיון נוסף, עד attempts; אחר כך — השגיאה האחרונה
//     כל שגיאה אחרת → נזרקת מיד
//
// הרצה:   node 12-design/starter/P12-E53.ts
// בדיקה:  npm run check P12-E53
