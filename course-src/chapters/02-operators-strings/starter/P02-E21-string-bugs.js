// P02-E21: ארבעה באגים. הפלט הרצוי:
// משתמש: DANA
// אורך השם: 4
// אימייל: dana@mail.com
// דומיין חוקי? true
const rawName = " dana ";
const rawEmail = "  Dana@Mail.com  ";

const name = rawName.trim().toUppercase();
console.log("משתמש:", name);
console.log("אורך השם:", name.length());

rawEmail.trim();
const email = rawEmail.toLowerCase();
console.log("אימייל:", email);
console.log("דומיין חוקי?", email.endsWith(".com"));
