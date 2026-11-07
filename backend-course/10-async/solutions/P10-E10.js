// P10-E10
function slowSquareRoot(n, ms = 10) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (typeof n !== "number" || Number.isNaN(n)) {
        reject(new Error("לא מספר"));
        return;
      }
      if (n < 0) {
        reject(new Error("אין שורש למספר שלילי"));
        return;
      }
      resolve(Math.sqrt(n));
    }, ms);
  });
}

slowSquareRoot(81).then(console.log);

module.exports = { slowSquareRoot };
