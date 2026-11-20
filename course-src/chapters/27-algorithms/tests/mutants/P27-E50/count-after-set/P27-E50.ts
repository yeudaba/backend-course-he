// P27-E50: כמה תת־מערכים מסתכמים ל־k?
export function countSubarraysWithSum(nums: number[], k: number): number {
  const seen = new Map<number, number>([[0, 1]]);
  let prefix = 0;
  let count = 0;
  for (const x of nums) {
    prefix += x;
    seen.set(prefix, (seen.get(prefix) ?? 0) + 1);
    count += seen.get(prefix - k) ?? 0;
  }
  return count;
}
