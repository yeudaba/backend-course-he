// P05-E22: transformAll תקינה. שלוש הקריאות בתחתית — לא. תקן רק את הקריאות.
function transformAll(from, to, fn) {
  let result = "";
  for (let i = from; i <= to; i++) {
    result += fn(i) + " ";
  }
  return result.trim();
}

const double = (n) => n * 2;
const label = (n) => `#${n}`;

const doubles = transformAll(1, 3, double(5)); // רצוי: "2 4 6"
const labels = transformAll(label, 1, 3); // רצוי: "#1 #2 #3"
const squares = transformAll(1, 3, (n) => { n * n; }); // רצוי: "1 4 9"

console.log(doubles);
console.log(labels);
console.log(squares);

module.exports = { transformAll, doubles, labels, squares };
