// P06-E22: שני באגים — תוצאה שגויה, וגם המחירון המקורי משתנה!
// cheapestThree([120, 15, 9, 300, 45]) → [9, 15, 45]
function cheapestThree(prices) {
  return prices.sort().slice(0, 3);
}

// מחזירה את המחיר הראשון ברשימה (כפי שהוזן במקור)
function firstListed(prices) {
  return prices[0];
}

const catalog = [120, 15, 9, 300, 45];
console.log(cheapestThree(catalog));
console.log(firstListed(catalog)); // צריך להיות 120

module.exports = { cheapestThree, firstListed };
