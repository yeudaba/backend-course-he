// P12-E24
export type Wallet = { id: string; balanceAgorot: number };
export interface WalletRepo {
  find(id: string): Promise<Wallet | null>;
  save(w: Wallet): Promise<void>;
}
export class NotFoundError extends Error {}
export class ValidationError extends Error {}
export class InsufficientFundsError extends Error {}

type TransferResult = { transferId: number; fromBalance: number; toBalance: number };

export class TransferService {
  #wallets: WalletRepo;
  #done = new Map<string, TransferResult>();
  #nextId = 1;

  constructor(wallets: WalletRepo) {
    this.#wallets = wallets;
  }

  async transfer(req: { from: string; to: string; amount: number; idempotencyKey: string }): Promise<TransferResult> {
    const previous = this.#done.get(req.idempotencyKey);
    if (previous) {
      return previous;
    }
    const agorot = Math.round(req.amount * 100);
    if (!(req.amount > 0) || Math.abs(req.amount * 100 - agorot) > 1e-9) {
      throw new ValidationError("סכום לא תקין");
    }
    if (req.from === req.to) {
      throw new ValidationError("לא ניתן להעביר לאותו ארנק");
    }
    const from = await this.#wallets.find(req.from);
    const to = await this.#wallets.find(req.to);
    if (!from || !to) {
      throw new NotFoundError("ארנק לא נמצא");
    }
    if (from.balanceAgorot < agorot) {
      throw new InsufficientFundsError("אין מספיק יתרה");
    }
    const newFrom = { ...from, balanceAgorot: from.balanceAgorot - agorot };
    const newTo = { ...to, balanceAgorot: to.balanceAgorot + agorot };
    await this.#wallets.save(newFrom);
    await this.#wallets.save(newTo);
    const result = { transferId: this.#nextId++, fromBalance: newFrom.balanceAgorot / 100, toBalance: newTo.balanceAgorot / 100 };
    this.#done.set(req.idempotencyKey, result);
    return result;
  }
}

const store = new Map<string, Wallet>([["a", { id: "a", balanceAgorot: 10000 }], ["b", { id: "b", balanceAgorot: 0 }]]);
const repo: WalletRepo = { find: async (id) => (store.has(id) ? { ...store.get(id)! } : null), save: async (w) => void store.set(w.id, { ...w }) };
const svc = new TransferService(repo);
const r1 = await svc.transfer({ from: "a", to: "b", amount: 19.9, idempotencyKey: "k1" });
const r2 = await svc.transfer({ from: "a", to: "b", amount: 19.9, idempotencyKey: "k1" });
console.log(r1, r1 === r2, store.get("a")?.balanceAgorot);
