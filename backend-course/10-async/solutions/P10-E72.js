// P10-E72: promisify משלך
function promisify(fn) {
  return (...args) =>
    new Promise((resolve, reject) => {
      fn(...args, (err, value) => {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
}

function addLater(a, b, cb) {
  setTimeout(() => (typeof a === "number" ? cb(null, a + b) : cb(new TypeError("לא מספר"))), 5);
}
const add = promisify(addLater);
add(2, 3)
  .then(console.log)
  .then(() => add("x", 1))
  .catch((e) => console.log(e.message))
  .then(() => promisify(require("node:fs").readFile)("/no/such.txt", "utf8"))
  .catch((e) => console.log(e.code));

module.exports = { promisify };
