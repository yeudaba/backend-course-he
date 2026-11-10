// P07-E26: mapValues עם Object.fromEntries
// mapValues(obj, fn) מחזירה אובייקט חדש עם אותם מפתחות, וכל ערך עובר דרך fn. obj לא משתנה.
// mapValues({ keyboard: 100, mouse: 50 }, (p) => p * 2) → { keyboard: 200, mouse: 100 }
//
// הרצה:   node 07-objects/starter/P07-E26.js
// בדיקה:  npm run check P07-E26
function mapValues(obj, fn) {
  // כתוב כאן
}

console.log(mapValues({ keyboard: 100, mouse: 50 }, (p) => p * 2));

module.exports = { mapValues };
