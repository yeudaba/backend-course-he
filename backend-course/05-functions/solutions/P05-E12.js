// P05-E12: פונקציה שמקבלת פונקציה
function applyTwice(fn, value) {
  return fn(fn(value));
}

function applyN(fn, value, times) {
  let result = value;
  for (let i = 0; i < times; i++) {
    result = fn(result);
  }
  return result;
}

console.log(applyTwice((x) => x + 3, 10));
console.log(applyN((s) => s + "!", "היי", 3));

module.exports = { applyTwice, applyN };
