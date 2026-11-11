const maxLength = 70;
const message = "  נפגשים מחר ב־8 בבוקר ליד הכניסה  ";
const clean = message.trim();
console.log(`הודעה: [${clean}]`);
console.log(`אורך: ${clean.length}`);
console.log(`נשארו: ${maxLength - clean.length}`);
console.log(`תצוגה מקדימה: ${clean.slice(0, 10)}...`);
