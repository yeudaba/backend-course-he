// P12-E52: כל השגיאות בבת אחת
export class LineError extends Error {
  readonly line: number;
  constructor(line: number, reason: string) {
    super(`שורה ${line}: ${reason}`);
    this.name = new.target.name;
    this.line = line;
  }
}

export class ImportError extends Error {
  readonly errors: LineError[];
  constructor(errors: LineError[]) {
    super(`${errors.length} שורות לא תקינות`);
    this.name = new.target.name;
    this.errors = errors;
  }
}

export function parseExpenses(text: string): { title: string; amount: number }[] {
  const rows: { title: string; amount: number }[] = [];
  const errors: LineError[] = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "") continue;
    const parts = lines[i].split(",").map((p) => p.trim());
    if (parts.length !== 2) {
      errors.push(new LineError(i + 1, "צריך שני שדות"));
      continue;
    }
    const [title, rawAmount] = parts;
    const amount = Number(rawAmount);
    if (title === "") {
      errors.push(new LineError(i + 1, "כותרת ריקה"));
    } else if (rawAmount === "" || !Number.isFinite(amount) || amount <= 0) {
      errors.push(new LineError(i + 1, "סכום לא תקין"));
    } else {
      rows.push({ title, amount });
    }
  }
  if (errors.length > 0) throw new ImportError(errors);
  return rows;
}

console.log(parseExpenses("קפה, 12\n\nספר,59.9\n"));
try {
  parseExpenses("קפה,12\nספר\n,5\nמונית,-3");
} catch (err) {
  if (err instanceof ImportError) console.log(err.message, err.errors.map((e) => e.message));
}
