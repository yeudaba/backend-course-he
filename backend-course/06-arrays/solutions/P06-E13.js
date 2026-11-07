// P06-E13: ספירה וערכים ייחודיים
function countOccurrences(arr, value) {
  let count = 0;
  for (const x of arr) {
    if (x === value) {
      count++;
    }
  }
  return count;
}

function unique(arr) {
  const result = [];
  for (const x of arr) {
    if (!result.includes(x)) {
      result.push(x);
    }
  }
  return result;
}

function mostFrequent(arr) {
  let best;
  let bestCount = 0;
  for (const value of unique(arr)) {
    const count = countOccurrences(arr, value);
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

console.log(unique([3, 1, 3, 2, 1]), mostFrequent(["a", "b", "b", "a", "b"]));

module.exports = { countOccurrences, unique, mostFrequent };
