// P03-E83: ארבע השוואות שטועות — כל התשובות יוצאות הפוכות. תקן רק את ההשוואות.
// הפלט הרצוי:
// מספיק במלאי? true
// אותו מזהה? true
// בגיר? false
// שם תואם? true
//
// הרצה:   node 03-conditions/starter/P03-E83.js
// בדיקה:  npm run check P03-E83
const stock = 5;
const ordered = 5;
const idFromUrl = "42";
const idInDb = 42;
const ageInput = "9";
const nameInput = "Dana ";
const savedName = "dana";

console.log("מספיק במלאי?", stock > ordered);
console.log("אותו מזהה?", idFromUrl === idInDb);
console.log("בגיר?", ageInput >= "18");
console.log("שם תואם?", nameInput === savedName);
