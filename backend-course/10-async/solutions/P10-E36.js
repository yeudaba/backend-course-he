// P10-E36: שעון מתקתק
function ticker(times, ms, onTick, onDone) {
  function step(n) {
    setTimeout(() => {
      if (n > times) {
        onDone();
        return;
      }
      onTick(n);
      if (n === times) {
        onDone();
      } else {
        step(n + 1);
      }
    }, ms);
  }
  step(1);
}

ticker(3, 10, (n) => console.log("טיק", n), () => console.log("סוף"));
ticker(0, 5, () => console.log("לא אמור לרוץ"), () => console.log("סוף בלי טיקים"));

module.exports = { ticker };
