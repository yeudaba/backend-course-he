// P11-E06
export function formatPrice(amount: number, currency = "₪"): string {
  return `${currency}${amount.toFixed(2)}`;
}

export function isAdult(age: number): boolean {
  return age >= 18;
}

export function average(nums: number[]): number {
  if (nums.length === 0) {
    return 0;
  }
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

console.log(formatPrice(12.5), isAdult(17), average([1, 2, 3]));
