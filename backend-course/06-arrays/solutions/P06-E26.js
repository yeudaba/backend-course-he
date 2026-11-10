// P06-E26: range
function range(start, end, step = 1) {
  if (step <= 0) return [];
  const result = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}

console.log(range(1, 5));
console.log(range(0, 10, 3));

module.exports = { range };
