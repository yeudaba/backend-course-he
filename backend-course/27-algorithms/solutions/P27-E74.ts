// P27-E74: הרווח המקסימלי — מעבר אחד
export function maxProfit(prices: number[]) {
  let best: { profit: number; buy: number; sell: number } | null = null;
  let minAt = 0;
  for (let i = 1; i < prices.length; i++) {
    const profit = prices[i] - prices[minAt];
    if (profit > 0 && (!best || profit > best.profit)) best = { profit, buy: minAt, sell: i };
    if (prices[i] < prices[minAt]) minAt = i;
  }
  return best;
}
