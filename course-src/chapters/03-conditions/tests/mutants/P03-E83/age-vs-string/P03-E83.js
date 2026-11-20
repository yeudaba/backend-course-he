// P03-E83: ארבע השוואות — מתוקן
const stock = 5;
const ordered = 5;
const idFromUrl = "42";
const idInDb = 42;
const ageInput = "9";
const nameInput = "Dana ";
const savedName = "dana";

console.log("מספיק במלאי?", stock >= ordered);
console.log("אותו מזהה?", Number(idFromUrl) === idInDb);
console.log("בגיר?", ageInput >= "18");
console.log("שם תואם?", nameInput.trim().toLowerCase() === savedName);
