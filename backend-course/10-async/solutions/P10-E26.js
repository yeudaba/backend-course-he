// P10-E26: חיבור אסינכרוני עם callback
function addLater(a, b, callback) {
  setTimeout(() => {
    if (typeof a !== "number" || typeof b !== "number") {
      callback(new TypeError("a ו־b חייבים להיות מספרים"));
      return;
    }
    callback(null, a + b);
  }, 10);
}

addLater(2, 3, (err, sum) => console.log(err, sum));
addLater(2, "3", (err) => console.log(err.message));
console.log("קודם אני");

module.exports = { addLater };
