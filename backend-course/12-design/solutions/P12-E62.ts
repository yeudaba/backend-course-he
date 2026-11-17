// P12-E62: שירות קופונים
export type Coupon = { code: string; percent: number; expiresAt: number; usesLeft: number; minTotal: number };

export interface CouponRepository {
  find(code: string): Promise<Coupon | null>;
  save(c: Coupon): Promise<void>;
}

export class CouponError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class CouponService {
  #coupons: CouponRepository;
  #now: () => number;

  constructor(coupons: CouponRepository, now: () => number) {
    this.#coupons = coupons;
    this.#now = now;
  }

  async apply(code: string, total: number): Promise<number> {
    const c = await this.#coupons.find(code.trim().toUpperCase());
    if (c === null) throw new CouponError("קופון לא קיים");
    if (this.#now() >= c.expiresAt) throw new CouponError("הקופון פג תוקף");
    if (c.usesLeft <= 0) throw new CouponError("הקופון נוצל");
    if (total < c.minTotal) throw new CouponError(`מינימום הזמנה: ${c.minTotal}`);
    await this.#coupons.save({ ...c, usesLeft: c.usesLeft - 1 });
    return Math.round(total * (1 - c.percent / 100) * 100) / 100;
  }
}

const store = new Map<string, Coupon>([["SALE10", { code: "SALE10", percent: 10, expiresAt: 5000, usesLeft: 1, minTotal: 50 }]]);
const repo: CouponRepository = {
  async find(code) {
    const c = store.get(code);
    return c ? { ...c } : null;
  },
  async save(c) {
    store.set(c.code, { ...c });
  },
};
let t = 1000;
const service = new CouponService(repo, () => t);
async function demo() {
  console.log(await service.apply(" sale10 ", 199.9));
  for (const [code, total] of [["SALE10", 100], ["NOPE", 100]] as const) {
    try {
      await service.apply(code, total);
    } catch (err) {
      console.log(String(err));
    }
  }
}
demo();
