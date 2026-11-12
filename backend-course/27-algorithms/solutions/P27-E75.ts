// P27-E75: מכפלה חוץ מעצמי — בלי חילוק
export function productExceptSelf(nums: number[]): number[] {
  const out = new Array<number>(nums.length);
  let left = 1;
  for (let i = 0; i < nums.length; i++) {
    out[i] = left;
    left *= nums[i];
  }
  let right = 1;
  for (let i = nums.length - 1; i >= 0; i--) {
    out[i] *= right;
    right *= nums[i];
  }
  return out;
}
