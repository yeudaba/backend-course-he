// P27-E07
// Map של "ערך ← אינדקס" למה שכבר ראינו: לכל מחיר בודקים אם ההשלמה שלו כבר הופיעה. O(n)
export function twoSum(prices: readonly number[], target: number): [number, number] | null {
  const seenAt = new Map<number, number>();
  for (let j = 0; j < prices.length; j++) {
    const i = seenAt.get(target - prices[j]);
    if (i !== undefined) return [i, j];
    if (!seenAt.has(prices[j])) seenAt.set(prices[j], j); // הראשון — כדי שהזוג יהיה הכי מוקדם
  }
  return null;
}
