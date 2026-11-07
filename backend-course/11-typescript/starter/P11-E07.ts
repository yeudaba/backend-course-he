// P11-E07: קוד מפרק 6. הוסף טיפוסים לפרמטרים ולערכי ההחזרה — בלי any ובלי לשנות לוגיקה.
export function cleanTags(input, max = 5) {
  return input
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag !== "")
    .filter((tag, i, all) => all.indexOf(tag) === i)
    .slice(0, max);
}

export function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export function median(nums) {
  if (nums.length === 0) {
    return null;
  }
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
