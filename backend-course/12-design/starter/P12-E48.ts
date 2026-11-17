// P12-E48: שולח התראות — הרכבה ושגיאה עם cause
// כתוב וייצא (export):
//   type Sender = { send(phone: string, text: string): void }
//   class NotifyError extends Error — readonly sent; cause = השגיאה המקורית; name נכון
//   class Notifier — constructor(sender: Sender) בשדה פרטי
//     notifyAll(users: { name; phone? }[], text): number — רק למי שיש טלפון;
//     send זורקת → NotifyError("השליחה ל־<name> נכשלה", sent, err)
//
// הרצה:   node 12-design/starter/P12-E48.ts
// בדיקה:  npm run check P12-E48
