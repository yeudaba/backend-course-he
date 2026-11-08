// P27-E24
// תכנון דינמי (DP): התשובה לסכום a נבנית מהתשובות לסכומים קטנים יותר — כל אחד מחושב פעם אחת. O(amount × coins)
export function minCoins(coins: readonly number[], amount: number): number {
  const best = new Array<number>(amount + 1).fill(Infinity);
  best[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && best[a - c] + 1 < best[a]) best[a] = best[a - c] + 1;
    }
  }
  return best[amount] === Infinity ? -1 : best[amount];
}

// כמה צירופים (בלי חשיבות לסדר): הלולאה החיצונית על המטבעות — כך 1+2 ו־2+1 נספרים פעם אחת
export function countWays(coins: readonly number[], amount: number): number {
  const ways = new Array<number>(amount + 1).fill(0);
  ways[0] = 1;
  for (const c of coins) {
    for (let a = c; a <= amount; a++) ways[a] += ways[a - c];
  }
  return ways[amount];
}
