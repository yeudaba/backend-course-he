// P08-E66: המע״מ הכפול — תיקון
// addVatAll(products): מערך חדש של אובייקטים חדשים, price כולל מע״מ (18%), מעוגל ל־2 ספרות. בלי לשנות את הקלט.
// יש באג — הקריאה השנייה מחזירה מע״מ כפול. אשר עם הדיבאגר (Watch על products[0].price) ותקן.
//
// הרצה:   node 08-modules-errors/starter/P08-E66.js
// בדיקה:  npm run check P08-E66

function addVatAll(products) {
  return products.map((p) => {
    p.price = Math.round(p.price * 1.18 * 100) / 100;
    return p;
  });
}

const catalog = [{ name: "עט", price: 10 }];
console.log(addVatAll(catalog), addVatAll(catalog));

// השורה הזו מאפשרת לבודק להשתמש בפונקציה. אל תמחק אותה.
module.exports = { addVatAll };
