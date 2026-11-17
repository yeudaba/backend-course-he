// P08-E59: עם הדיבאגר: מילה אחת יותר מדי
// countWords(text): כמה מילים (רווחים כפולים ובקצוות לא נספרים).
// countWords("learn node js") → 3 | countWords("") → 0
// יש באג. מצא אותו עם הדיבאגר (breakpoint בתוך הלולאה), בלי console.log.
//
// הרצה:   node 08-modules-errors/starter/P08-E59.js
// בדיקה:  npm run check P08-E59

function countWords(text) {
  const words = text.split(" ");
  let count = 0;
  for (let i = 0; i <= words.length; i++) {
    if (words[i] !== "") {
      count++;
    }
  }
  return count;
}

console.log(countWords("learn node js"));

// השורה הזו מאפשרת לבודק להשתמש בפונקציה. אל תמחק אותה.
module.exports = { countWords };
