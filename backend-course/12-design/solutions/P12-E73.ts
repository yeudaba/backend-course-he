// P12-E73: מזהה מהבקשה
export class ValidationError extends Error {
  readonly field: string;
  constructor(field: string, message: string) {
    super(message);
    this.name = new.target.name;
    this.field = field;
  }
}

export function parseId(input: unknown, field = "id"): number {
  let n = NaN;
  if (typeof input === "number") n = input;
  else if (typeof input === "string" && /^\d+$/.test(input.trim())) n = Number(input.trim());
  if (!Number.isSafeInteger(n) || n <= 0) {
    throw new ValidationError(field, `${field} חייב להיות מספר שלם חיובי`);
  }
  return n;
}

for (const input of [7, " 42 ", "12abc", 0, "", 3.5]) {
  try {
    console.log(parseId(input));
  } catch (err) {
    if (err instanceof ValidationError) console.log(err.field, "←", err.message);
  }
}
