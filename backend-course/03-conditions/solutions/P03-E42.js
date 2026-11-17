const idFromUrl = "42";
const idInDb = 42;
console.log(`סוג המזהה מה־URL: ${typeof idFromUrl}`);
console.log(`בלי המרה: ${idFromUrl === idInDb}`);
console.log(`עם המרה: ${Number(idFromUrl) === idInDb}`);
