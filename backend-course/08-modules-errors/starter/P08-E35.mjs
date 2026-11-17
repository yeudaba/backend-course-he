// P08-E35: המרה ל־ES Modules
// הקוד כתוב ב־CommonJS, אבל הקובץ הוא .mjs. המר ל־ES Modules:
// initials ו־greet — ייצוא בשם (export), formatUser — ייצוא default.
//
// הרצה:   node 08-modules-errors/starter/P08-E35.mjs
// בדיקה:  npm run check P08-E35

function initials(fullName) {
  return fullName
    .split(" ")
    .filter((w) => w !== "")
    .map((w) => w[0].toUpperCase())
    .join(".");
}

function greet(name) {
  return `שלום, ${name}!`;
}

function formatUser(user) {
  return `${user.name} (${initials(user.name)})`;
}

console.log(formatUser({ name: "dana levi" }));

module.exports = { initials, greet, formatUser };

