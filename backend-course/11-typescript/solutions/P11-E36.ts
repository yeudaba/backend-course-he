// P11-E36: ממוצע עם טיפוסים
export function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sum = nums.reduce((s, n) => s + n, 0);
  return Math.round((sum / nums.length) * 100) / 100;
}

export function above(nums: number[], limit: number): number[] {
  return nums.filter((n) => n > limit);
}

console.log(average([90, 85, 77]), average([]), average([1, 2]));
console.log(above([5, 12, 8, 30], 8));
