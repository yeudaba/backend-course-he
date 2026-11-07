// P11-E07: אותה לוגיקה מפרק 6, עם טיפוסים
export function cleanTags(input: string, max = 5): string[] {
  return input
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag !== "")
    .filter((tag, i, all) => all.indexOf(tag) === i)
    .slice(0, max);
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export function median(nums: number[]): number | null {
  if (nums.length === 0) {
    return null;
  }
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

console.log(cleanTags(" A, b ,a"), chunk([1, 2, 3], 2), median([3, 1, 2]));
