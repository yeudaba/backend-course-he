// P29-E33: כמה יעלה בחודש, בכל מודל
const PRICES: Record<string, [number, number]> = {
  "claude-opus-5-5": [4, 20],
  "claude-sonnet-5-5": [2, 10],
  "claude-haiku-5-5": [0.1, 0.5],
};

export function compareModels(load: { requestsPerDay: number; inputTokens: number; outputTokens: number; days?: number }) {
  const { requestsPerDay, inputTokens, outputTokens, days = 30 } = load;
  for (const n of [requestsPerDay, inputTokens, outputTokens, days]) {
    if (!Number.isFinite(n) || n < 0) throw new RangeError(`מספר לא תקין: ${n}`);
  }
  const requests = requestsPerDay * days;
  return Object.entries(PRICES)
    .map(([model, [inPrice, outPrice]]) => ({ model, exact: (requests * inputTokens * inPrice + requests * outputTokens * outPrice) / 1_000_000 }))
    .sort((a, b) => a.exact - b.exact)
    .map(({ model, exact }) => ({ model, usd: Math.round(exact * 100) / 100 }));
}
