// P08-E94: להדגיש מילת חיפוש
// highlight(text, word): כל הופעה של word בטקסט (בלי הבדל בין גדולות לקטנות) עטופה ב־**...**,
// בכתיב המקורי שלה. word מגיע מהמשתמש: גם "c++" או "1.5" הם טקסט, לא תבנית.
// word ריק ← הטקסט בלי שינוי.
//
// הרצה:   node 08-modules-errors/starter/P08-E94.js
// בדיקה:  npm run check P08-E94

function highlight(text, word) {
  // כתוב כאן
}

console.log(highlight("C++ או c++? בחר c++", "c++"));

// השורה הזו מאפשרת לבודק להשתמש בפונקציה. אל תמחק אותה.
module.exports = { highlight };
