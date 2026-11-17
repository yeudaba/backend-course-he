// P12-E76: פריטי הזמנה עם נתיב בשגיאה
export class ValidationError extends Error {
  readonly field: string;
  constructor(field: string, message: string) {
    super(message);
    this.name = new.target.name;
    this.field = field;
  }
}

const isInt = (v: unknown, max: number): v is number => typeof v === "number" && Number.isInteger(v) && v > 0 && v <= max;

export function parseItems(input: unknown): { productId: number; qty: number }[] {
  if (!Array.isArray(input) || input.length < 1 || input.length > 50) {
    throw new ValidationError("items", "items חייב להיות מערך של 1–50 פריטים");
  }
  const totals = new Map<number, number>();
  input.forEach((item: unknown, i: number) => {
    const path = `items[${i}]`;
    if (typeof item !== "object" || item === null || Array.isArray(item)) throw new ValidationError(path, `${path} לא תקין`);
    const productId = "productId" in item ? item.productId : undefined;
    const qty = "qty" in item ? item.qty : undefined;
    if (!isInt(productId, Number.MAX_SAFE_INTEGER)) throw new ValidationError(`${path}.productId`, `${path}.productId לא תקין`);
    if (!isInt(qty, 100)) throw new ValidationError(`${path}.qty`, `${path}.qty לא תקין`);
    const sum = (totals.get(productId) ?? 0) + qty;
    if (sum > 100) throw new ValidationError("items", `יותר מ־100 יחידות של מוצר ${productId}`);
    totals.set(productId, sum);
  });
  return [...totals].map(([productId, qty]) => ({ productId, qty }));
}

console.log(parseItems([{ productId: 7, qty: 2 }, { productId: 3, qty: 1 }, { productId: 7, qty: 5 }]));
for (const bad of [[], [{ productId: 1, qty: 1 }, { productId: 2, qty: 0 }], [{ productId: 1, qty: 60 }, { productId: 1, qty: 50 }]]) {
  try {
    parseItems(bad);
  } catch (err) {
    if (err instanceof ValidationError) console.log(err.field, "←", err.message);
  }
}
