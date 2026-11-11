// P12-E39: יומן ציונים
// כתוב וייצא (export):
//   class Gradebook (Map<string, number[]> פרטי):
//     add(student, grade) — שלם 0–100, אחרת RangeError("ציון לא תקין: <grade>"); שם ריק → Error("שם ריק")
//     average(student) — מעוגל לספרה אחת; אין ציונים → Error("אין ציונים ל־<student>")
//     top(n) — [{ student, average }] מהגבוה לנמוך, שוויון לפי שם · get students
//
// הרצה:   node 12-design/starter/P12-E39.ts
// בדיקה:  npm run check P12-E39
