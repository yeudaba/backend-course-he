// P05-E22: העברת פונקציות כארגומנט — מתוקן
function transformAll(from, to, fn) {
  let result = "";
  for (let i = from; i <= to; i++) {
    result += fn(i) + " ";
  }
  return result.trim();
}

const double = (n) => n * 2;
const label = (n) => `#${n}`;

const doubles = transformAll(1, 3, double);
const labels = transformAll(1, 3, label);
const squares = transformAll(1, 3, (n) => n * n);

console.log(doubles);
console.log(labels);
console.log(squares);

module.exports = { transformAll, doubles, labels, squares };
