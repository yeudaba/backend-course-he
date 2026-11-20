// P22-E55: invalidCases(valid, bad) — גוף תקין עם שדה אחד שגוי בכל פעם
// כתוב וייצא: invalidCases(valid, bad) ← [{ name, body }]
//   לכל שדה ב־bad: "בלי <field>", ואז "<field> = <JSON של הערך>" לכל ערך שגוי
//   valid לא משתנה · שדה שאין ב־valid ← Error("אין שדה <field> בגוף התקין")
//
// בדיקה:  npm run check P22-E55
