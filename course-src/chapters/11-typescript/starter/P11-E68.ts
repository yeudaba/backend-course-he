// P11-E68: פקודות CLI כ־union
// כתוב וייצא (export):
//   type Command — add { name, amount } | list | remove { id } | error { message } (שדה kind)
//   parseCommand(line: string): Command — בלי throw:
//     add <name> <amount> (amount חיובי, אחרת "סכום לא תקין")
//     list (בלי מילים נוספות)
//     remove <id> (שלם חיובי, אחרת "מזהה לא תקין")
//     מספר מילים לא נכון → "שימוש: add <name> <amount>" / "שימוש: list" / "שימוש: remove <id>"
//     אחר / ריק → "פקודה לא מוכרת"
//
// הרצה:   node 11-typescript/starter/P11-E68.ts
// בדיקה:  npm run check P11-E68
