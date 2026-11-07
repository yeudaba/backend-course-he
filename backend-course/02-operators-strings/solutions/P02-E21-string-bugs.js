const rawName = " dana ";
const rawEmail = "  Dana@Mail.com  ";

const name = rawName.trim().toUpperCase();
console.log("משתמש:", name);
console.log("אורך השם:", name.length);

const email = rawEmail.trim().toLowerCase();
console.log("אימייל:", email);
console.log("דומיין חוקי?", email.endsWith(".com"));
