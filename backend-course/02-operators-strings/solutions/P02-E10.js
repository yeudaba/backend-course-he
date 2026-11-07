const rawEmail = "   Yossi.Cohen@Gmail.COM  ";
const email = rawEmail.trim().toLowerCase();

console.log(`אימייל: ${email}`);
console.log(`אורך: ${email.length}`);
console.log(`יש @? ${email.includes("@")}`);
console.log(`נגמר ב־.com? ${email.endsWith(".com")}`);
