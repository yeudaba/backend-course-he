// P08-E61: עם הדיבאגר: יתרה רצה
// runningBalance(start, transactions) → היתרה אחרי כל פעולה. amount יכול להיות מחרוזת.
// שני באגים (אחד מהם משנה את הקלט). מצא עם הדיבאגר: Watch על balance ועל t.
//
// הרצה:   node 08-modules-errors/starter/P08-E61.js
// בדיקה:  npm run check P08-E61

function runningBalance(start, transactions) {
  const result = [];
  let balance = start;
  for (const t of transactions) {
    if ((t.type = "in")) {
      balance += t.amount;
    } else {
      balance -= t.amount;
    }
    result.push(balance);
  }
  return result;
}

console.log(runningBalance(100, [
  { type: "in", amount: 50 },
  { type: "out", amount: "30" },
  { type: "out", amount: 5 },
]));

// השורה הזו מאפשרת לבודק להשתמש בפונקציה. אל תמחק אותה.
module.exports = { runningBalance };
