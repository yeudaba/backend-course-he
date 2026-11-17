// P15-E54: שגיאות של התחום ל־HTTP
import express, { type Request, type Response, type NextFunction } from "express";

export class InsufficientFundsError extends Error {
  constructor(balance: number, amount: number) {
    super(`אין מספיק כסף: יתרה ${balance}, ביקשת ${amount}`);
    this.name = "InsufficientFundsError";
  }
}
export class AccountNotFoundError extends Error {
  constructor(id: string) {
    super(`חשבון ${id} לא קיים`);
    this.name = "AccountNotFoundError";
  }
}

export class Bank {
  #balances: Map<string, number>;
  constructor(balances: Map<string, number>) {
    this.#balances = balances;
  }
  withdraw(id: string, amount: number): number {
    const balance = this.#balances.get(id);
    if (balance === undefined) throw new AccountNotFoundError(id);
    if (amount > balance) throw new InsufficientFundsError(balance, amount);
    this.#balances.set(id, balance - amount);
    return balance - amount;
  }
}

function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  const send = (status: number, code: string, message: string) => res.status(status).json({ error: { code, message } });
  if (err instanceof AccountNotFoundError) return void send(404, "ACCOUNT_NOT_FOUND", err.message);
  if (err instanceof InsufficientFundsError) return void send(409, "INSUFFICIENT_FUNDS", err.message);
  console.error(err);
  send(500, "INTERNAL", "שגיאה פנימית");
}

export function createApp(bank: Bank) {
  const app = express();
  app.use(express.json());
  app.post("/accounts/:id/withdraw", (req, res) => {
    const amount = req.body?.amount;
    if (!Number.isInteger(amount) || amount <= 0) {
      res.status(400).json({ error: { code: "VALIDATION", message: "amount חייב להיות מספר שלם חיובי" } });
      return;
    }
    const balance = bank.withdraw(req.params.id, amount);
    res.json({ id: req.params.id, balance });
  });
  app.use(errorHandler);
  return app;
}

const server = createApp(new Bank(new Map([["A1", 500]]))).listen(0, async () => {
  const address = server.address();
  const base = `http://localhost:${typeof address === "object" && address ? address.port : 0}`;
  const withdraw = (id: string, amount: unknown) =>
    fetch(`${base}/accounts/${id}/withdraw`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount }) });
  for (const res of [await withdraw("A1", 200), await withdraw("A1", 400), await withdraw("B2", 1), await withdraw("A1", "10")]) {
    console.log(res.status, await res.text());
  }
  server.close();
});
